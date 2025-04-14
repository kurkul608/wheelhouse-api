import Bull from "bull";

export const periodMessageQueue = new Bull("periodMessageQueue", {
  redis: { host: process.env.REDIS_HOST, port: 6379 },
});
