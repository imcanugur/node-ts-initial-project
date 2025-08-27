import { RateLimiterRedis } from "rate-limiter-flexible";
import { Redis } from "./Redis";
import config from "config";

export class RateLimiter {
  private limiter: RateLimiterRedis;
  private redis: Redis;
  private config: { points: number; duration: number; blockDuration: number };

  constructor() {
    this.redis = new Redis();
    this.config = config.get("app.rate_limiter") as {
      points: number;
      duration: number;
      blockDuration: number;
    };

    this.limiter = new RateLimiterRedis({
      storeClient: this.redis.client,
      points: this.config.points,
      duration: this.config.duration,
      blockDuration: this.config.blockDuration,
    });
  }

  async consume(key: string): Promise<void> {
    try {
      await this.limiter.consume(key);
    } catch (error) {
      throw new Error(`Anahtar için kullanım sınırı aşıldı: ${key}`);
    }
  }
}
