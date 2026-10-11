import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Env } from './config/env.js';
import { InMemoryStore } from './data/store.js';
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
import { InMemoryNotificationRepository } from './modules/notifications/notification.repository.js';
import { notificationRoutes } from './modules/notifications/notification.routes.js';
import { SimpleCategoryRules } from './modules/requests/categoryRules.js';
import { RequestController } from './modules/requests/request.controller.js';
import { InMemoryRequestRepository } from './modules/requests/request.repository.js';
import { requestRoutes } from './modules/requests/request.routes.js';
import { RequestService } from './modules/requests/request.service.js';
import { UserController } from './modules/users/user.controller.js';
import { InMemoryUserRepository } from './modules/users/user.repository.js';
import { userRoutes } from './modules/users/user.routes.js';
import { UserService } from './modules/users/user.service.js';

export interface AppContext {
  app: Express;
  store: InMemoryStore;
  events: EventBus;
  channels: ChannelSet;
  dispatcher: NotificationDispatcher;
  authService: AuthService;
}


export function createApp(env: Env): AppContext {
  const store = new InMemoryStore();
  const events = new EventBus();

  // Data access (temporary in-memory implementations)
  const userRepo = new InMemoryUserRepository(store);
  const requestRepo = new InMemoryRequestRepository(store);
  const notificationRepo = new InMemoryNotificationRepository(store);

  // Services
  const tokens = new TokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);
  const authService = new AuthService(store, userRepo, tokens);
  const userService = new UserService(store, userRepo);
  const requestService = new RequestService(store, requestRepo, userRepo, new SimpleCategoryRules(), events);
  const channels = createChannels();
  const dispatcher = new NotificationDispatcher(store, notificationRepo, channels);
  const managementService = new ManagementService(requestRepo, requestService);

  
  registerNotificationHandler(events, userRepo, notificationRepo);

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
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

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
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

  return { app, store, events, channels, dispatcher, authService };
}
