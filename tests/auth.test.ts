import request from 'supertest';
import app from '../src/app';
import { registerUser, loginUser } from './helpers';

describe('Auth', () => {
  it('POST /auth/register returns user and tokens', async () => {
    const { res } = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user).toHaveProperty('_id');
  });

  it('POST /auth/register returns 400 on missing fields', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'a@test.com' });
    expect(res.status).toBe(400);
  });

  it('POST /auth/register returns 409 on duplicate user', async () => {
    const { payload } = await registerUser({ email: 'dup@test.com', username: 'dupuser' });
    const res = await request(app).post('/auth/register').send(payload);
    expect(res.status).toBe(409);
  });

  it('POST /auth/login returns tokens on success', async () => {
    const { payload } = await registerUser();
    const res = await loginUser(payload.email, payload.password);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('POST /auth/login returns 401 on wrong credentials', async () => {
    const { payload } = await registerUser();
    const res = await loginUser(payload.email, 'wrong-password');
    expect(res.status).toBe(401);
  });

  it('POST /auth/refresh returns new access token', async () => {
    const { res } = await registerUser();
    const refreshToken = res.body.refreshToken;
    const refreshRes = await request(app).post('/auth/refresh').send({ token: refreshToken });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty('accessToken');
  });

  it('POST /auth/refresh returns 401 on invalid token', async () => {
    const refreshRes = await request(app).post('/auth/refresh').send({ token: 'bad-token' });
    expect(refreshRes.status).toBe(401);
  });

  it('POST /auth/logout invalidates refresh token', async () => {
    const { res } = await registerUser();
    const refreshToken = res.body.refreshToken;

    const logoutRes = await request(app).post('/auth/logout').send({ token: refreshToken });
    expect(logoutRes.status).toBe(200);

    const refreshRes = await request(app).post('/auth/refresh').send({ token: refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});
