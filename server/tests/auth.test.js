import request from 'supertest';
import { jest } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';

let app;

beforeAll(async () => {
  await setupTestDB();
  const mod = await import('../src/app.js');
  app = mod.createApp();
});
afterEach(clearTestDB);
afterAll(teardownTestDB);

describe('Authentication', () => {
  test('registers a new user and sets an httpOnly auth cookie', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Ada Lovelace', email: 'ada@example.com', password: 'supersecure1'
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('ada@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true);
  });

  test('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({ name: 'A', email: 'dup@example.com', password: 'supersecure1' });
    const res = await request(app).post('/api/auth/register').send({ name: 'B', email: 'dup@example.com', password: 'supersecure1' });
    expect(res.status).toBe(409);
  });

  test('rejects login with wrong password', async () => {
    await request(app).post('/api/auth/register').send({ name: 'C', email: 'c@example.com', password: 'supersecure1' });
    const res = await request(app).post('/api/auth/login').send({ email: 'c@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('rejects weak password on registration', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'D', email: 'd@example.com', password: 'short' });
    expect(res.status).toBe(400);
  });

  test('GET /me requires authentication', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /me returns the logged-in user via cookie', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({ name: 'E', email: 'e@example.com', password: 'supersecure1' });
    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('e@example.com');
  });
});
