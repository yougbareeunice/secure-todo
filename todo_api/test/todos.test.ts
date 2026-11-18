import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import {
  api,
  bearer,
  closeTestDatabase,
  connectTestDatabase,
  registerUser,
  resetDatabase,
} from './helpers.ts';

describe('todos', () => {
  let token: string;

  before(connectTestDatabase);
  beforeEach(async () => {
    await resetDatabase();
    token = (await registerUser()).accessToken;
  });
  after(closeTestDatabase);

  const createTodo = (title: string, accessToken = token) =>
    api.post('/api/v1/todos').set(bearer(accessToken)).send({ title });

  it('requires authentication', async () => {
    const res = await api.get('/api/v1/todos');
    assert.equal(res.status, 401);
  });

  it('creates, reads, updates and deletes a todo', async () => {
    const created = await createTodo(' Write the lab ');
    assert.equal(created.status, 201);
    assert.equal(created.body.data.title, 'Write the lab'); // trimmed
    assert.equal(created.body.data.completed, false);
    const id = created.body.data.id;

    const fetched = await api.get(`/api/v1/todos/${id}`).set(bearer(token));
    assert.equal(fetched.status, 200);

    const updated = await api
      .patch(`/api/v1/todos/${id}`)
      .set(bearer(token))
      .send({ completed: true });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.completed, true);
    assert.equal(updated.body.data.title, 'Write the lab'); // untouched

    const removed = await api.delete(`/api/v1/todos/${id}`).set(bearer(token));
    assert.equal(removed.status, 204);

    const gone = await api.get(`/api/v1/todos/${id}`).set(bearer(token));
    assert.equal(gone.status, 404);
  });

  it('validates input', async () => {
    const empty = await createTodo(' ');
    assert.equal(empty.status, 422);

    const badId = await api.get('/api/v1/todos/123').set(bearer(token));
    assert.equal(badId.status, 422);

    const created = await createTodo('Valid');
    const emptyPatch = await api
      .patch(`/api/v1/todos/${created.body.data.id}`)
      .set(bearer(token))
      .send({});
    assert.equal(emptyPatch.status, 422);
  });

  it('paginates and filters the list', async () => {
    for (const title of ['one', 'two', 'three']) await createTodo(title);
    const list = await api.get('/api/v1/todos').set(bearer(token));
    await api
      .patch(`/api/v1/todos/${list.body.data[0].id}`)
      .set(bearer(token))
      .send({ completed: true });

    const page1 = await api
      .get('/api/v1/todos?page=1&limit=2')
      .set(bearer(token));
    assert.equal(page1.body.data.length, 2);
    assert.deepEqual(page1.body.meta, {
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    });

    const done = await api
      .get('/api/v1/todos?completed=true')
      .set(bearer(token));
    assert.equal(done.body.data.length, 1);
  });

  it('isolates the todos of each user', async () => {
    const mine = await createTodo('Private note');
    const other = await registerUser('grace@example.com');
    const id = mine.body.data.id;

    const list = await api.get('/api/v1/todos').set(bearer(other.accessToken));
    assert.equal(list.body.data.length, 0);

    const read = await api
      .get(`/api/v1/todos/${id}`)
      .set(bearer(other.accessToken));
    assert.equal(read.status, 404);

    const patch = await api
      .patch(`/api/v1/todos/${id}`)
      .set(bearer(other.accessToken))
      .send({ title: 'Hacked' });
    assert.equal(patch.status, 404);

    const del = await api
      .delete(`/api/v1/todos/${id}`)
      .set(bearer(other.accessToken));
    assert.equal(del.status, 404);
  });
});