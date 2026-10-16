import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Env } from './config/env.js';
import type pg from 'pg';
import { InMemoryStore } from './data/store.js';
import { createPool, PostgresStore } from './db/postgres.js';
import { EventBus } from './shared/eventBus.js';
import { errorHandler, notFoundHandler } from './shared/http/errorHandler.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { requireAuth } from './modules/auth/auth.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { AuthService } from './modules/auth/auth.service.js';
import { TokenService } from './modules/auth/token.js';
import { ManagementController } from './modules/management/management.controller.js';
import { managementRoutes } from './modules/management/management.routes.js';
import { ManagementService } from './modules/management/management.service.js';
import { createChannels, type ChannelSet } from './modules/notifications/channels.js';
import { NotificationController } from './modules/notifications/notification.controller.js';
import { NotificationDispatcher } from './modules/notifications/notification.dispatcher.js';
import { registerNotificationHandler } from './modules/notifications/notification.handler.js';
import { InMemoryNotificationRepository, type NotificationRepository } from './modules/notifications/notification.repository.js';
import { PostgresNotificationRepository } from './modules/notifications/notification.repository.postgres.js';
import { notificationRoutes } from './modules/notifications/notification.routes.js';
import { SimpleCategoryRules } from './modules/requests/categoryRules.js';
import { RequestController } from './modules/requests/request.controller.js';
import { InMemoryRequestRepository, type RequestRepository } from './modules/requests/request.repository.js';
import { PostgresRequestRepository } from './modules/requests/request.repository.postgres.js';
import { requestRoutes } from './modules/requests/request.routes.js';
import { RequestService } from './modules/requests/request.service.js';
import { UserController } from './modules/users/user.controller.js';
import { InMemoryUserRepository, type UserRepository } from './modules/users/user.repository.js';
import { PostgresUserRepository } from './modules/users/user.repository.postgres.js';
import { userRoutes } from './modules/users/user.routes.js';
import { UserService } from './modules/users/user.service.js';

export interface AppContext {
  app: Express;
  /** Where the data lives: PostgreSQL when DATABASE_URL is set, otherwise the temporary in-memory store. */
  storage: 'postgres' | 'memory';
  store: PostgresStore | InMemoryStore;
  events: EventBus;
  channels: ChannelSet;
  dispatcher: NotificationDispatcher;
  authService: AuthService;
  /** Closes the database connections (used on shutdown and after tests). */
  close(): Promise<void>;
}

export interface CreateAppOptions {
  /** Re-use an existing PostgreSQL pool (the tests share one). */
  pool?: pg.Pool;
}

interface DataLayer {
  storage: AppContext['storage'];
  store: PostgresStore | InMemoryStore;
  userRepo: UserRepository;
  requestRepo: RequestRepository;
  notificationRepo: NotificationRepository;
  close(): Promise<void>;
}

/**
 * Picks the data layer. Both versions implement the same repository interfaces and the same
 * TransactionManager, so nothing above this point knows (or cares) which one is used.
 */
function createDataLayer(env: Env, options: CreateAppOptions): DataLayer {
  if (options.pool || env.DATABASE_URL) {
    const ownsPool = !options.pool;
    const pool = options.pool ?? createPool({ connectionString: env.DATABASE_URL!, ssl: env.DATABASE_SSL });
    const store = new PostgresStore(pool);
    return {
      storage: 'postgres',
      store,
      userRepo: new PostgresUserRepository(store),
      requestRepo: new PostgresRequestRepository(store),
      notificationRepo: new PostgresNotificationRepository(store),
      close: () => (ownsPool ? store.close() : Promise.resolve()),
    };
  }
  const store = new InMemoryStore();
  return {
    storage: 'memory',
    store,
    userRepo: new InMemoryUserRepository(store),
    requestRepo: new InMemoryRequestRepository(store),
    notificationRepo: new InMemoryNotificationRepository(store),
    close: () => Promise.resolve(),
  };
}

/**
 * Composition root: wires the modules of the layered modular monolith together.
 * Routes -> controllers (HTTP in/out) -> services (business rules) -> repositories (data access).
 * The data layer (PostgreSQL or in-memory) is chosen once, in createDataLayer().
 */
export function createApp(env: Env, options: CreateAppOptions = {}): AppContext {
  const data = createDataLayer(env, options);
  const { store, userRepo, requestRepo, notificationRepo } = data;
  const events = new EventBus();

  // Services
  const tokens = new TokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);
  const authService = new AuthService(store, userRepo, tokens);
  const userService = new UserService(store, userRepo);
  const requestService = new RequestService(store, requestRepo, userRepo, new SimpleCategoryRules(), events);
  const channels = createChannels();
  const dispatcher = new NotificationDispatcher(store, notificationRepo, channels);
  const managementService = new ManagementService(requestRepo, requestService);

  // Event handlers (Observer)
  registerNotificationHandler(events, userRepo, notificationRepo);

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // correct client IPs behind a hosting proxy (used by the rate limiter)
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  const authenticate = requireAuth(tokens, userRepo);

  app.get('/api/health', async (_req, res) => {
    let database = 'not used (in-memory storage)';
    if (store instanceof PostgresStore) {
      database = await store.pool
        .query('SELECT 1')
        .then(() => 'connected')
        .catch(() => 'unreachable');
    }
    res.status(database === 'unreachable' ? 503 : 200).json({
      status: database === 'unreachable' ? 'degraded' : 'ok',
      storage: data.storage,
      database,
      time: new Date().toISOString(),
    });
  });
  app.use(
    '/api/auth',
    authRoutes(new AuthController(authService, userService), authenticate, { rateLimit: env.NODE_ENV !== 'test' }),
  );
  app.use('/api/users', userRoutes(new UserController(userService, authService), authenticate));
  app.use('/api/requests', requestRoutes(new RequestController(requestService), authenticate));
  app.use('/api/management', managementRoutes(new ManagementController(managementService), authenticate));
  app.use(
    '/api/notifications',
    notificationRoutes(new NotificationController(notificationRepo, dispatcher), authenticate),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, storage: data.storage, store, events, channels, dispatcher, authService, close: data.close };
}
