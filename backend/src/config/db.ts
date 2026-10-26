import pg from 'pg';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isNeon = (process.env.DATABASE_URL || '').includes('neon.tech');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/apaar_aicte_db',
  ssl: isNeon ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true
});

redis.on('error', (err) => {
  console.warn('Redis connection notice (falling back or retrying):', err.message);
});
