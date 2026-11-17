import argon2 from 'argon2';
import { AppError } from '../../shared/errors.ts';
import type { LoginInput, RegisterInput } from './auth.schemas.ts';
import { User, toUserDto, type UserDocument } from './user.model.ts';
import {
  issueRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
} from './token.service.ts';

async function buildSession(user: UserDocument) {
  const userId = user._id.toString();
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(userId),
    issueRefreshToken(userId),
  ]);
  return { user: toUserDto(user), accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const exists = await User.exists({ email: input.email });
  if (exists) throw AppError.conflict('This email is already registered');

  // argon2id is the default variant: the current OWASP recommendation.
  const passwordHash = await argon2.hash(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });
  return buildSession(user);
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select(
    '+passwordHash',
  );

  // Same message for "unknown email" and "wrong password":
  // do not tell an attacker which emails have an account.
  const valid =
    user !== null && (await argon2.verify(user.passwordHash, input.password));
  if (!user || !valid) {
    throw AppError.unauthorized('Invalid email or password');
  }
  return buildSession(user);
}

export async function refresh(token: string) {
  const { userId, refreshToken } = await rotateRefreshToken(token);
  const accessToken = await signAccessToken(userId);
  return { accessToken, refreshToken };
}

export async function logout(token: string): Promise<void> {
  await revokeRefreshToken(token);
}

export async function getProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw AppError.unauthorized();
  return toUserDto(user);
}