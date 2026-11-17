import type { Request, Response } from 'express';
import { currentUserId } from '../../shared/authenticate.ts';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas.ts';
import * as authService from './auth.service.ts';

// A controller only translates HTTP <-> service calls:
// 1. validate the input 2. call the service 3. send the response.

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const session = await authService.register(input);
  res.status(201).json({ data: session });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const session = await authService.login(input);
  res.json({ data: session });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  const tokens = await authService.refresh(refreshToken);
  res.json({ data: tokens });
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  await authService.logout(refreshToken);
  res.status(204).end();
}

export async function me(req: Request, res: Response) {
  const user = await authService.getProfile(currentUserId(req));
  res.json({ data: user });
}