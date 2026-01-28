import request from 'supertest';
import app from '../src/app';
import { buildUserPayload } from './helpers';

describe('Users', () => {
  it('POST /users creates a user', async () => {
    const payload = buildUserPayload();
    const res = await request(app).post('/users').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('username', payload.username);
  });

  it('GET /users returns all users', async () => {
    const payload1 = buildUserPayload();
    const payload2 = buildUserPayload();
    await request(app).post('/users').send(payload1);
    await request(app).post('/users').send(payload2);

    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /users/:id returns a user', async () => {
    const payload = buildUserPayload();
    const createRes = await request(app).post('/users').send(payload);
    const userId = createRes.body._id;

    const res = await request(app).get(`/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', userId);
  });

  it('PUT /users/:id updates a user', async () => {
    const payload = buildUserPayload();
    const createRes = await request(app).post('/users').send(payload);
    const userId = createRes.body._id;

    const updateRes = await request(app)
      .put(`/users/${userId}`)
      .send({ username: 'updated-user', email: 'updated@test.com' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toHaveProperty('username', 'updated-user');
  });

  it('DELETE /users/:id deletes a user', async () => {
    const payload = buildUserPayload();
    const createRes = await request(app).post('/users').send(payload);
    const userId = createRes.body._id;

    const deleteRes = await request(app).delete(`/users/${userId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toHaveProperty('message', 'User deleted');
  });

  it('GET /users/:id returns 400 for invalid ObjectId', async () => {
    const res = await request(app).get('/users/not-a-valid-id');
    expect(res.status).toBe(400);
  });
});
