import Redis from 'ioredis';
import pino from 'pino';

const logger = pino({ name: 'redis' });

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

// In-Memory Fallback Map (for development & offline testing without running Redis instance)
const memoryStore = new Map<string, string>();

let isConnected = false;

const ioredisClient = new Redis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: 1,
  connectTimeout: 1000,
  retryStrategy(times) {
    if (times > 1) {
      return null; // Stop reconnecting and use in-memory store
    }
    return 500;
  },
  lazyConnect: true,
});

ioredisClient.on('connect', () => {
  isConnected = true;
  logger.info('Connected to Redis In-Memory Client.');
});

ioredisClient.on('error', (err) => {
  isConnected = false;
  // silent warning
});

/**
 * Resilient Redis Interface that transparently falls back to in-memory store
 */
export const redis = {
  async get(key: string): Promise<string | null> {
    if (isConnected) {
      try {
        return await ioredisClient.get(key);
      } catch {
        // fallback
      }
    }
    return memoryStore.get(key) || null;
  },

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    if (isConnected) {
      try {
        if (mode && duration) {
          return await (ioredisClient as any).set(key, value, mode, duration);
        }
        return await ioredisClient.set(key, value);
      } catch {
        // fallback
      }
    }
    memoryStore.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => {
        memoryStore.delete(key);
      }, duration * 1000);
    }
    return 'OK';
  },

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    if (isConnected) {
      try {
        count = await ioredisClient.del(...keys);
      } catch {
        // fallback
      }
    }
    for (const k of keys) {
      if (memoryStore.delete(k)) count++;
    }
    return count;
  },

  disconnect() {
    try {
      ioredisClient.disconnect();
    } catch {
      // ignore
    }
  },
};

export const CACHE_KEYS = {
  HOME_FEED: 'feed:home:v1',
  CATEGORY_FEED: (cat: string) => `feed:category:${cat.toLowerCase()}`,
};

export const CACHE_TTL_SECONDS = 300; // 5 minutes

/**
 * Deterministic Cache Eviction (Section 4.2)
 * Whenever an article is created or updated, immediately evicts home & category caches.
 */
export async function evictArticleFeeds(category: string): Promise<void> {
  try {
    const keysToEvict = [CACHE_KEYS.HOME_FEED, CACHE_KEYS.CATEGORY_FEED(category)];
    await redis.del(...keysToEvict);
    logger.info(`Evicted Redis cache keys: ${keysToEvict.join(', ')}`);
  } catch (error) {
    logger.warn(`Cache eviction non-fatal error: ${(error as Error).message}`);
  }
}
