
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  auth,
  setup,
  validRequest,
  type TestContext,
} from './helpers.js';

/**
 * SEN381 M3:
 * Municipal service request API integration tests.
 *
 * Uses the actual Express application via Supertest.
 * Each test gets an isolated backend test context.
 */

const municipalCategories = [
  ['ROAD_PAVEMENT', 'Road & Pavement'],
  ['STREET_LIGHTING', 'Street Lighting'],
  ['STORMWATER_DRAIN', 'Stormwater & Drain'],
  ['SOLID_WASTE', 'Solid Waste'],
  ['PARKS_GREENERY', 'Parks & Greenery'],
  ['CODE_COMPLIANCE', 'Code Compliance'],
] as const;

let ctx: TestContext;

beforeEach(async () => {
  ctx = await setup();
});

describe('Municipal service request API', () => {
  it('lists all six municipal categories in request metadata', async () => {
    // TC-MUN-001

    const response = await ctx.api
      .get('/api/requests/meta')
      .set(auth(ctx.users.requester));

    expect(response.status).toBe(200);

    for (const [value, label] of municipalCategories) {
      expect(response.body.categories).toContainEqual({
        value,
        label,
      });
    }
  });

  it.each(municipalCategories)(
    'accepts a valid %s service request',
    async (category) => {
      // TC-MUN-002 through TC-MUN-007

      const response = await ctx.api
        .post('/api/requests')
        .set(auth(ctx.users.requester))
        .send({
          ...validRequest,
          category,
          location: 'Municipal service location',
        });

      expect(response.status).toBe(201);

      expect(response.body.request.category).toBe(
        category,
      );

      expect(response.body.request.priority).toBe(
        'MEDIUM',
      );

      expect(response.body.request.status).toBe(
        'SUBMITTED',
      );

      expect(response.body.request.reference).toMatch(
        /^CC-\d{4}-\d{6}$/,
      );
    },
  );

  it.each(municipalCategories)(
    'rejects %s requests without a location',
    async (category) => {
      // TC-MUN-008 through TC-MUN-013

      const response = await ctx.api
        .post('/api/requests')
        .set(auth(ctx.users.requester))
        .send({
          ...validRequest,
          category,
          location: '',
        });

      expect(response.status).toBe(400);

      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'location',
          }),
        ]),
      );
    },
  );

  it('rejects an unsupported municipal category', async () => {
    // TC-MUN-014

    const response = await ctx.api
      .post('/api/requests')
      .set(auth(ctx.users.requester))
      .send({
        ...validRequest,
        category: 'UNKNOWN_SERVICE',
        location: 'Central Avenue',
      });

    expect(response.status).toBe(400);
  });

  it('preserves compatibility with the existing IT_SUPPORT category', async () => {
    // TC-MUN-015

    const response = await ctx.api
      .post('/api/requests')
      .set(auth(ctx.users.requester))
      .send({
        ...validRequest,
        category: 'IT_SUPPORT',
        location: '',
      });

    expect(response.status).toBe(201);

    expect(response.body.request.category).toBe(
      'IT_SUPPORT',
    );
  });
});
