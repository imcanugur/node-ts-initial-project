import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from "routing-controllers";
import { Service } from "typedi";
import { Logger } from "../config/Logger";
import config from "config";

@Service()
@Middleware({ type: "after" })
export class HttpErrorHandler implements ExpressErrorMiddlewareInterface {
  private loggerService: Logger;
  private env: string;

  constructor() {
    this.loggerService = new Logger();
    this.env = config.get("app.env");
  }

  error(error: any, request: any, response: any, next: (err: any) => any) {
    const constraintErrors =
      error.errors?.map((err: any) => Object.values(err.constraints)).flat() ||
      [];
    const hasValidateMessage = constraintErrors.length > 0;

    if (this.env === "production") {
      this.loggerService.error(error.message, {
        error: error.errors,
        validateMessage: constraintErrors,
        stack: error.stack,
        status: error.httpCode,
        url: request.originalUrl,
        method: request.method,
        timestamp: new Date().toISOString(),
        ip: request.connection.remoteAddress,
      });

      response.status(error.httpCode || 500).json({
        status: error.httpCode || 500,
        validateMessage: hasValidateMessage ? constraintErrors : undefined,
        message: error.message,
        error: error.errors,
      });
    } else {
      response.status(error.httpCode || 500).json({
        status: error.httpCode || 500,
        validateMessage: hasValidateMessage ? constraintErrors : undefined,
        message: error.message,
        error: error.errors,
        stack: error.stack,
      });
    }
  }
}
