import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import pino from 'pino';
import { connectDatabase, disconnectDatabase } from './config/database';
import { articleRoutes } from './routes/v1/articles';
import { feedRoutes } from './routes/v1/feeds';

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: false, // We use explicit pino logger
    trustProxy: true,
  });

  // 1. Security & Helmet Headers
  await server.register(helmet, {
    contentSecurityPolicy: false,
  });

  // 2. Cross-Origin Resource Sharing
  await server.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  // 3. Rate Limit Gate (Section 7.2: TC-API-03)
  // 100 requests per 60-second window; 101-120 return HTTP 429
  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (request, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Maximum ${context.max} requests per ${context.after}.`,
    }),
  });

  // Health check endpoint
  server.get('/health', async () => {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'swaraj-digital-api',
    };
  });

  // API v1 Routing
  await server.register(
    async (v1) => {
      await v1.register(feedRoutes);
      await v1.register(articleRoutes);
    },
    { prefix: '/api/v1' }
  );

  return server;
}

export async function startServer() {
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';

  // Initialize DB Connection
  await connectDatabase();

  const server = await buildServer();

  try {
    await server.listen({ port, host });
    logger.info(`🚀 Swaraj Digital Fastify Engine running at http://${host}:${port}`);
    logger.info(`Feed Edge Cache: GET http://${host}:${port}/api/v1/feeds/home`);
  } catch (err) {
    logger.error(`Error starting server: ${(err as Error).message}`);
    process.exit(1);
  }

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      await server.close();
      await disconnectDatabase();
      process.exit(0);
    });
  });
}

// Auto-start when executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((e) => {
    console.error('Fatal server bootstrap failure:', e);
  });
}
