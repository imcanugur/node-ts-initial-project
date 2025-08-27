import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";
import { Service } from "typedi";
import { RateLimiter } from "../config/RateLimiter";
import { TooManyRequests } from "../responses/Errors";
import { NextFunction, Request, Response } from "express";

@Service()
@Middleware({ type: "before" })
export class RateLimiterMiddleware implements ExpressMiddlewareInterface {
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter();
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ipAddress =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.ip;
      const key = req.headers.authorization
        ? req.headers.authorization
        : ipAddress;

      if (typeof key === "string") {
        await this.rateLimiter.consume(key);
        next();
      } else {
        throw new Error("Rate limit key not found");
      }
    } catch (error) {
      if (!res.headersSent) {
        throw new TooManyRequests();
      }
    }
  }
}
