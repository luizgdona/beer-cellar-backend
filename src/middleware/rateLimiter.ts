import { Request, Response, NextFunction } from 'express';
import redis from 'redis';

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${parseInt(process.env.REDIS_PORT || '6379')}`,
});

redisClient.on('error', (err) => console.log('Redis error:', err));
redisClient.connect().catch((err) => {
  console.error('Redis connect error:', err);
});

export const rateLimiter = (maxRequests: number = 100, windowMs: number = 900000) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rate-limit:${req.ip}`;
      const current = await redisClient.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= maxRequests) {
        return res.status(429).json({ error: 'Too many requests, please try again later.' });
      }

      await redisClient.set(key, (count + 1).toString(), {
        EX: Math.floor(windowMs / 1000),
      });
      next();
    } catch (error) {
      // If Redis fails, allow the request but log the error
      console.error('Rate limiter error:', error);
      next();
    }
  };
};
