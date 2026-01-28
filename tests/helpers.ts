import request from 'supertest';
import app from '../src/app';

type UserPayload = {
  username: string;
  email: string;
  password: string;
};

const uniqueString = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const buildUserPayload = (overrides: Partial<UserPayload> = {}): UserPayload => {
  const base = {
    username: uniqueString('user'),
    email: `${uniqueString('user')}@test.com`,
    password: 'Password123!'
  };
  return { ...base, ...overrides };
};

export const registerUser = async (overrides: Partial<UserPayload> = {}) => {
  const payload = buildUserPayload(overrides);
  const res = await request(app).post('/auth/register').send(payload);
  return { payload, res };
};

export const loginUser = async (email: string, password: string) => {
  return request(app).post('/auth/login').send({ email, password });
};

export const createPost = async (accessToken: string, authorId: string, content?: string) => {
  const payload = { authorId, content: content || uniqueString('post') };
  return request(app)
    .post('/post')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload);
};

export const createComment = async (
  accessToken: string,
  postId: string,
  authorId: string,
  content?: string
) => {
  const payload = { postId, authorId, content: content || uniqueString('comment') };
  return request(app)
    .post('/comment')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload);
};
