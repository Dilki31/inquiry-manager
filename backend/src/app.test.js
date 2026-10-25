import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

beforeAll(() => {
  // config.js requires these before it is imported
  process.env.JWT_SECRET = 'test-secret';
  process.env.DATABASE_URL = 'postgresql://unused:unused@localhost:5432/unused';
});

describe('authentication is enforced by the API', () => {
  it('rejects a request without a token', async () => {
    const { createApp } = await import('./app.js');
    const res = await request(createApp()).get('/api/inquiries');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects a request with an invalid token', async () => {
    const { createApp } = await import('./app.js');
    const res = await request(createApp())
      .get('/api/inquiries')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });
});