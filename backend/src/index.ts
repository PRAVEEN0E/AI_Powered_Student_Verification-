import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { redis } from './config/db.js';
import { authRoutes } from './routes/auth.js';
import { studentRoutes } from './routes/students.js';
import { verificationRoutes } from './routes/verification.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { credentialRoutes } from './routes/credentials.js';
import { transferRoutes } from './routes/transfers.js';
import { institutionRoutes } from './routes/institutions.js';

dotenv.config();

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }
  });

  // Security headers
  await app.register(helmet, { contentSecurityPolicy: false });

  // Rate Limiting (Protects public APAAR verification & auth endpoints from brute force)
  await app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute'
  });

  // Multipart for CSV / Excel uploads
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  });

  // CORS configuration
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  });

  // JWT Plugin
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'super-secure-production-ready-apaar-aicte-secret-key-32chars'
  });

  // Authentication Decorator
  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }
  });

  // RBAC Role-Check Decorator
  app.decorate('authorize', (allowedRoles: string[]) => {
    return async (request: any, reply: any) => {
      if (!request.user || !allowedRoles.includes(request.user.role)) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: `Access denied. Requires role in [${allowedRoles.join(', ')}]`
        });
      }
    };
  });

  // Register Modular Route Handlers
  await app.register(authRoutes);
  await app.register(studentRoutes);
  await app.register(verificationRoutes);
  await app.register(dashboardRoutes);
  await app.register(credentialRoutes);
  await app.register(transferRoutes);
  await app.register(institutionRoutes);

  // Health check endpoint
  app.get('/health', async () => {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'APAAR AICTE Verification & Compliance Platform'
    };
  });

  return app;
}

async function start() {
  const app = await buildApp();
  const PORT = Number(process.env.PORT) || 5000;
  const HOST = process.env.HOST || '0.0.0.0';

  try {
    await redis.connect().catch(() => console.log('Redis initialized in connection pool'));
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 APAAR AICTE Platform Server is listening on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (process.argv[1]?.includes('index')) {
  start();
}
