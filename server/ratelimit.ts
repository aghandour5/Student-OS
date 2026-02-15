import { Request, Response, NextFunction } from "express";

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Periodically clean up expired entries to prevent memory leaks
// We use a safe interval that won't interfere with active windows
setInterval(
  () => {
    const currentTime = Date.now();
    for (const [ip, record] of memoryStore.entries()) {
      if (currentTime > record.resetTime) {
        memoryStore.delete(ip);
      }
    }
  },
  15 * 60 * 1000,
); // Every 15 minutes

export function rateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Rely on req.ip which is populated by Express and respects "trust proxy"
    const ip = (req.ip || "unknown").toString();
    const currentTime = Date.now();

    let record = memoryStore.get(ip);

    if (!record || currentTime > record.resetTime) {
      record = {
        count: 1,
        resetTime: currentTime + config.windowMs,
      };
      memoryStore.set(ip, record);
      return next();
    }

    record.count++;

    if (record.count > config.max) {
      res.setHeader(
        "Retry-After",
        Math.ceil((record.resetTime - currentTime) / 1000),
      );
      return res.status(429).json({ message: config.message });
    }

    next();
  };
}
