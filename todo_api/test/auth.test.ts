import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import {
  api,
  closeTestDatabase,
  connectTestDatabase,
  registerUser,
  resetDatabase,
} from './helpers.ts';

describe('auth', () => {
  before(connectTestDatabase);
  beforeEach(resetDatabase);
  after(closeTestDatabase);

  const ada = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'correct-horse-9',
  };

  it('registers a user and never returns passwordHash', async () => {
    const res = await api.post('/api/v1/auth/register').send(ada);
    assert.equal(res.status, 201);
    assert.ok(res.body.data.accessToken);
    assert.ok(res.body.data.refreshToken);
    assert.equal(JSON.stringify(res.body).includes('passwordHash'), false);
  });

  it('rejects a duplicate email with 409', async () => {
    await api.post('/api/v1/auth/register').send(ada);
    const again = await api.post('/api/v1/auth/register').send(ada);
    assert.equal(again.status, 409);
  });

  it('answers the same for a wrong password and an unknown email', async () => {
    await registerUser(); // ada@example.com / correct-horse-9
    const wrongPassword = await api
      .post('/api/v1/auth/login')
      .send({ email: 'ada@example.com', password: 'not-the-password' });
    const unknownEmail = await api
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'correct-horse-9' });

    assert.equal(wrongPassword.status, 401);
    assert.equal(unknownEmail.status, 401);
    assert.equal(
      wrongPassword.body.error.message,
      unknownEmail.body.error.message,
    );
  });

  it('lets a refresh token work once, then revokes the family', async () => {
    const { refreshToken: first } = await registerUser();

    const rotated = await api
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: first });
    assert.equal(rotated.status, 200);
    const second = rotated.body.data.refreshToken as string;
    assert.notEqual(second, first);

    const replay = await api
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: first });
    assert.equal(replay.status, 401);

    const newToken = await api
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: second });
    assert.equal(newToken.status, 401);
  });
});