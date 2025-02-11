import Redis from "ioredis";

export const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
});

export const CACHE_TTL = 12 * 60 * 60;
