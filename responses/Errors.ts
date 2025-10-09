import { HttpError } from "routing-controllers";

export class Error extends HttpError {
  public details?: any;

  constructor(code: number, message: string, details?: any) {
    super(code, message);
    this.details = details;
  }

  static from(code: number, message?: string, details?: any) {
    const defaultMessage = Error.defaultMessage(code);
    return new Error(code, message || defaultMessage, details);
  }

  private static defaultMessage(code: number): string {
    switch (code) {
      case 400:
        return "Bad Request";
      case 401:
        return "Unauthorized";
      case 403:
        return "Forbidden";
      case 404:
        return "Not Found";
      case 408:
        return "Request Timeout";
      case 429:
        return "Too Many Requests";
      case 500:
        return "Internal Server Error";
      case 503:
        return "Service Unavailable";
      default:
        return "Unexpected Error";
    }
  }
}

export class BadRequestError extends Error {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(400, message || "Bad Request", errors);
  }
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(404, message || "Not Found");
  }
}

export class TooManyRequests extends Error {
  constructor(message?: string) {
    super(429, message || "Too many requests. Please try again later.");
  }
}
