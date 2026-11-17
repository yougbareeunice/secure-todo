import type { Request, RequestHandler } from 'express';
import { AppError } from './errors.ts';
import { verifyAccessToken } from '../modules/auth/token.service.ts';

// Guards a route: the request must carry `Authorization: Bearer <token>`.
export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw AppError.unauthorized();
  }

  req.userId = await verifyAccessToken(token);
  next();
};

// Used by controllers behind `authenticate` to read the caller's id.
export function currentUserId(req: Request): string {
  if (!req.userId) throw AppError.unauthorized();
  return req.userId;
}