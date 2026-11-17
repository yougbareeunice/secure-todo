import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../../config/env.ts';
import { authenticate } from '../../shared/authenticate.ts';
import * as controller from './auth.controller.ts';

// Slow down password guessing: few attempts per IP per 15 minutes.
const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === 'production' ? 10 : 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: {
    error: { code: 'TOO_MANY_REQUESTS', message: 'Try again later' },
  },
});

export const authRoutes = Router();

authRoutes.post('/register', credentialsLimiter, controller.register);
authRoutes.post('/login', credentialsLimiter, controller.login);
authRoutes.post('/refresh', controller.refresh);
authRoutes.post('/logout', controller.logout);
authRoutes.get('/me', authenticate, controller.me);