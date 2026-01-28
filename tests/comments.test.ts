import request from 'supertest';
import app from '../src/app';
import { registerUser, createPost, createComment } from './helpers';

describe('Comments', () => {
  it('POST /comment returns 401 without token', async () => {
    const res = await request(app)
      .post('/comment')
      .send({ postId: '123', authorId: '456', content: 'hello' });
    expect(res.status).toBe(401);
  });

  it('POST /comment creates a comment with valid token', async () => {
    const { res: userRes } = await registerUser();
    const { accessToken, user } = userRes.body;

    const postRes = await createPost(accessToken, user._id, 'post for comment');
    const postId = postRes.body._id;

    const commentRes = await createComment(accessToken, postId, user._id, 'new comment');
    expect(commentRes.status).toBe(201);
    expect(commentRes.body).toHaveProperty('_id');
  });

  it('PUT /comment/:id enforces auth and ownership', async () => {
    const { res: ownerRes } = await registerUser();
    const { accessToken: ownerToken, user: owner } = ownerRes.body;

    const { res: otherRes } = await registerUser();
    const { accessToken: otherToken } = otherRes.body;

    const postRes = await createPost(ownerToken, owner._id, 'post for comment');
    const postId = postRes.body._id;

    const commentRes = await createComment(ownerToken, postId, owner._id, 'owned comment');
    const commentId = commentRes.body._id;

    const noAuthRes = await request(app)
      .put(`/comment/${commentId}`)
      .send({ authorId: owner._id, content: 'update' });
    expect(noAuthRes.status).toBe(401);

    const forbiddenRes = await request(app)
      .put(`/comment/${commentId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ authorId: owner._id, content: 'update' });
    expect(forbiddenRes.status).toBe(403);

    const okRes = await request(app)
      .put(`/comment/${commentId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ authorId: owner._id, content: 'updated comment' });
    expect(okRes.status).toBe(200);
    expect(okRes.body).toHaveProperty('content', 'updated comment');
  });

  it('DELETE /comment/:id enforces auth and ownership', async () => {
    const { res: ownerRes } = await registerUser();
    const { accessToken: ownerToken, user: owner } = ownerRes.body;

    const { res: otherRes } = await registerUser();
    const { accessToken: otherToken } = otherRes.body;

    const postRes = await createPost(ownerToken, owner._id, 'post for comment');
    const postId = postRes.body._id;

    const commentRes = await createComment(ownerToken, postId, owner._id, 'owned comment');
    const commentId = commentRes.body._id;

    const noAuthRes = await request(app).delete(`/comment/${commentId}`);
    expect(noAuthRes.status).toBe(401);

    const forbiddenRes = await request(app)
      .delete(`/comment/${commentId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(forbiddenRes.status).toBe(403);

    const okRes = await request(app)
      .delete(`/comment/${commentId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(okRes.status).toBe(200);
  });

  it('GET /comment/post/:postId returns comments for a post', async () => {
    const { res: userRes } = await registerUser();
    const { accessToken, user } = userRes.body;

    const postRes = await createPost(accessToken, user._id, 'post for comment list');
    const postId = postRes.body._id;

    await createComment(accessToken, postId, user._id, 'first comment');
    await createComment(accessToken, postId, user._id, 'second comment');

    const listRes = await request(app).get(`/comment/post/${postId}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(2);
  });
});
