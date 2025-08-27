import IRedis from "ioredis";
import config from "config";
import { Service } from "typedi";

@Service()
export class Redis {
  public client: IRedis;

  private config: {
    host: string;
    port: number;
    db: number;
    expires_in: number;
    family: number;
  };

  constructor() {
    this.config = config.get<{
      host: string;
      port: number;
      db: number;
      expires_in: number;
      family: number;
    }>("app.redis");

    this.client = new IRedis({
      host: this.config.host,
      port: this.config.port,
      db: this.config.db,
      family: this.config.family,
    });
  }

  async setJson(key: string, value: any, expireInSec?: number): Promise<void> {
    try {
      const stringified = JSON.stringify(value);
      if (expireInSec) {
        await this.client.set(key, stringified, "EX", expireInSec);
      } else {
        await this.client.set(key, stringified);
      }
    } catch (err) {
      throw new Error(`Failed to set JSON for key ${key}: ${err}`);
    }
  }

  async getJson<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      throw new Error(`Failed to parse JSON for key ${key}: ${err}`);
    }
  }

  async lpush(userId: string, value: string): Promise<void> {
    const key = `${this.config.host}:${userId}`;
    try {
      await this.client.lpush(key, value);
    } catch (err) {
      throw new Error(`Failed to push value to list ${key}: ${err}`);
    }
  }

  async lrange(userId: string, start: number, stop: number): Promise<string[]> {
    const key = `${this.config.host}:${userId}`;

    try {
      return await this.client.lrange(key, start, stop);
    } catch (err) {
      throw new Error(`Failed to range list ${key}: ${err}`);
    }
  }

  async lrem(userId: string, count: number, value: string): Promise<number> {
    const key = `${this.config.host}:${userId}`;

    try {
      return await this.client.lrem(key, count, value);
    } catch (err) {
      throw new Error(`Failed to remove value from list ${key}: ${err}`);
    }
  }

  async expire(userId: string, seconds: number): Promise<void> {
    const key = `${this.config.host}:${userId}`;

    try {
      await this.client.expire(key, seconds);
    } catch (err) {
      throw new Error(`Failed to set expiration for key ${key}: ${err}`);
    }
  }

  async set(userId: string, tokens: string[]): Promise<void> {
    const key = `${this.config.host}:${userId}`;
    try {
      await this.client.set(
        key,
        JSON.stringify(tokens),
        "EX",
        this.config.expires_in,
      );
    } catch (err) {
      throw new Error(`Failed to set tokens for user ${userId}: ${err}`);
    }
  }

  async get(key: string): Promise<string[] | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      throw new Error(`Failed to get tokens for user ${key}: ${err}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      throw new Error(`Failed to delete tokens for user ${key}: ${err}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1; // 1: key exists, 0: key does not exist
    } catch (err) {
      throw new Error(`Failed to check existence of key ${key}: ${err}`);
    }
  }

  async increment(key: string, incrementBy: number = 1): Promise<number> {
    try {
      return await this.client.incrby(key, incrementBy);
    } catch (err) {
      throw new Error(`Failed to increment key ${key}: ${err}`);
    }
  }

  async decrement(key: string, decrementBy: number = 1): Promise<number> {
    try {
      return await this.client.decrby(key, decrementBy);
    } catch (err) {
      throw new Error(`Failed to decrement key ${key}: ${err}`);
    }
  }

  async flushdb(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (err) {
      throw new Error(`Failed to flush Redis database: ${err}`);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (err) {
      throw new Error(`Failed to get keys with pattern ${pattern}: ${err}`);
    }
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.client.mget(keys);
    } catch (err) {
      throw new Error(`Failed to get multiple keys: ${err}`);
    }
  }

  async mset(entries: Record<string, string>): Promise<void> {
    try {
      await this.client.mset(entries);
    } catch (err) {
      throw new Error(`Failed to set multiple keys: ${err}`);
    }
  }

  async quit(): Promise<void> {
    try {
      await this.client.quit();
    } catch (err) {
      throw new Error(`Failed to close Redis connection: ${err}`);
    }
  }
}
