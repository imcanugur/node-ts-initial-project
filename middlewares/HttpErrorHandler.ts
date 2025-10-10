import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from "routing-controllers";
import { Service } from "typedi";
import { Logger } from "@/config/Logger";
import config from "config";
import { respond } from "@/utils/respond";

@Service()
@Middleware({ type: "after" })
export class HttpErrorHandler implements ExpressErrorMiddlewareInterface {
  private logger: Logger;
  private readonly env: string;

  constructor() {
    this.logger = new Logger();
    this.env = config.get("app.env");
  }

  async error(error: any, req: any, res: any, next: (err: any) => any) {
    const constraintErrors =
      error.errors?.map((err: any) => Object.values(err.constraints)).flat() ||
      [];
    const hasValidateMessage = constraintErrors.length > 0;

    const status = error.httpCode || error.status || 500;
    const message = error.message || "Internal Server Error";

    let extra = {};

    if (this.env === "production") {
      this.logger.error(error.message, {
        error: error.errors,
        validateMessage: constraintErrors,
        stack: error.stack,
        status: error.httpCode,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        ip: req.connection.remoteAddress,
      });

      extra = {
        status: error.httpCode || 500,
        validateMessage: hasValidateMessage ? constraintErrors : undefined,
        message: error.message,
        error: error.errors,
      };
    }

    extra = {
      error: error.errors,
      validateMessage: constraintErrors,
      stack: error.stack,
      status: error.httpCode,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
      ip: req.connection.remoteAddress,
    };

    return respond(res, status, message, extra);
  }
}
