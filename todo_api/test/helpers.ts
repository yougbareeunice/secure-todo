import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.ts';
import { env } from '../src/config/env.ts';

export const api = request(createApp());

export async function connectTestDatabase() {
  if (!env.MONGO_URI.endsWith('_test')) {
    throw new Error('Refusing to run tests on a non-test database');
  }
  await mongoose.connect(env.MONGO_URI);
}

export async function resetDatabase() {
  await mongoose.connection.dropDatabase();
  // dropDatabase also drops the indexes: rebuild them (unique email...).
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.syncIndexes()),
  );
}

export async function closeTestDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

// Registers a user and returns its session (user + both tokens).
export async function registerUser(email = 'ada@example.com') {
  const res = await api
    .post('/api/v1/auth/register')
    .send({ name: 'Ada Lovelace', email, password: 'correct-horse-9' });
  return res.body.data as {
    user: { id: string; email: string };
    accessToken: string;
    refreshToken: string;
  };
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });