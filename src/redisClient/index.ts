import Redis from "ioredis";

export const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
});

// 12 Hours
export const CACHE_TTL = 12 * 60 * 60;
// 1 day
export const ONE_DAY_CACHE_TTL = 2 * CACHE_TTL;
// 1 week
export const ONE_WEEK_CACHE_TTL = 7 * ONE_DAY_CACHE_TTL;
// month
export const ONE_MONTH_CACHE_TTL = 4 * ONE_WEEK_CACHE_TTL;
