import request from 'supertest';
import app from '../src/app';
import { registerUser, createPost } from './helpers';

describe('Posts', () => {
  it('POST /post returns 401 without token', async () => {
    const res = await request(app).post('/post').send({ authorId: '123', content: 'hello' });
    expect(res.status).toBe(401);
  });

  it('POST /post creates a post with valid token', async () => {
    const { res: registerRes } = await registerUser();
    const { accessToken, user } = registerRes.body;

    const postRes = await createPost(accessToken, user._id, 'new post');
    expect(postRes.status).toBe(201);
    expect(postRes.body).toHaveProperty('_id');
  });

  it('PUT /post/:id enforces auth and ownership', async () => {
    const { res: ownerRes } = await registerUser();
    const { accessToken: ownerToken, user: owner } = ownerRes.body;

    const { res: otherRes } = await registerUser();
    const { accessToken: otherToken } = otherRes.body;

    const postRes = await createPost(ownerToken, owner._id, 'owned post');
    const postId = postRes.body._id;

    const noAuthRes = await request(app)
      .put(`/post/${postId}`)
      .send({ authorId: owner._id, content: 'update' });
    expect(noAuthRes.status).toBe(401);

    const forbiddenRes = await request(app)
      .put(`/post/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ authorId: owner._id, content: 'update' });
    expect(forbiddenRes.status).toBe(403);

    const okRes = await request(app)
      .put(`/post/${postId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ authorId: owner._id, content: 'updated content' });
    expect(okRes.status).toBe(200);
    expect(okRes.body).toHaveProperty('content', 'updated content');
  });

  it('DELETE /post/:id enforces auth and ownership', async () => {
    const { res: ownerRes } = await registerUser();
    const { accessToken: ownerToken, user: owner } = ownerRes.body;

    const { res: otherRes } = await registerUser();
    const { accessToken: otherToken } = otherRes.body;

    const postRes = await createPost(ownerToken, owner._id, 'owned post');
    const postId = postRes.body._id;

    const noAuthRes = await request(app).delete(`/post/${postId}`);
    expect(noAuthRes.status).toBe(401);

    const forbiddenRes = await request(app)
      .delete(`/post/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(forbiddenRes.status).toBe(403);

    const okRes = await request(app)
      .delete(`/post/${postId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(okRes.status).toBe(200);
  });

  it('GET /post and GET /post/:id are public', async () => {
    const { res: ownerRes } = await registerUser();
    const { accessToken, user } = ownerRes.body;
    const postRes = await createPost(accessToken, user._id, 'public post');
    const postId = postRes.body._id;

    const listRes = await request(app).get('/post');
    expect(listRes.status).toBe(200);

    const getRes = await request(app).get(`/post/${postId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveProperty('_id', postId);
  });
});
