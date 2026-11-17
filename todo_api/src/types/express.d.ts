// Tell TypeScript that our auth middleware adds `userId` to the request.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};