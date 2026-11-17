import { createApp } from './app.ts';
import { connectDatabase, disconnectDatabase } from './config/db.ts';
import { env } from './config/env.ts';
import { logger } from './shared/logger.ts';

await connectDatabase();

const server = createApp().listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}`);
});

// Graceful shutdown: finish in-flight requests, then close the database.
async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));