import request from 'supertest';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';

let app;

beforeAll(async () => {
  await setupTestDB();
  const mod = await import('../src/app.js');
  app = mod.createApp();
});
afterEach(clearTestDB);
afterAll(teardownTestDB);

async function registerAndLogin(agent, email) {
  await agent.post('/api/auth/register').send({ name: 'User', email, password: 'supersecure1' });
}

describe('Project-level data isolation', () => {
  test('a user cannot read another user\'s project', async () => {
    const ownerAgent = request.agent(app);
    await registerAndLogin(ownerAgent, 'owner@example.com');
    const spaceRes = await ownerAgent.post('/api/spaces').send({ name: 'Owner Space' });
    const projectRes = await ownerAgent.post(`/api/spaces/${spaceRes.body.space._id}/projects`).send({ name: 'Owner Project' });
    const projectId = projectRes.body.project._id;

    const intruderAgent = request.agent(app);
    await registerAndLogin(intruderAgent, 'intruder@example.com');
    const res = await intruderAgent.get(`/api/projects/${projectId}`);
    expect(res.status).toBe(403);
  });

  test('a user cannot read another user\'s space', async () => {
    const ownerAgent = request.agent(app);
    await registerAndLogin(ownerAgent, 'owner2@example.com');
    const spaceRes = await ownerAgent.post('/api/spaces').send({ name: 'Private Space' });

    const intruderAgent = request.agent(app);
    await registerAndLogin(intruderAgent, 'intruder2@example.com');
    const res = await intruderAgent.get(`/api/spaces/${spaceRes.body.space._id}`);
    expect(res.status).toBe(403);
  });

  test('an invalid project id is rejected, not treated as not-found information leak', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'user3@example.com');
    const res = await agent.get('/api/projects/not-a-valid-id');
    expect(res.status).toBe(400);
  });

  test('a user only sees their own spaces in the list', async () => {
    const a = request.agent(app);
    await registerAndLogin(a, 'a@example.com');
    await a.post('/api/spaces').send({ name: 'A Space' });

    const b = request.agent(app);
    await registerAndLogin(b, 'b@example.com');
    await b.post('/api/spaces').send({ name: 'B Space' });

    const res = await a.get('/api/spaces');
    expect(res.body.spaces.length).toBe(1);
    expect(res.body.spaces[0].name).toBe('A Space');
  });
});
