import Bull from "bull";

export const messageQueue = new Bull("messageQueue", {
  redis: { host: process.env.REDIS_HOST, port: 6379 },
});
