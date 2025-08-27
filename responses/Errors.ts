import { HttpError } from "routing-controllers";

export class BadRequestError extends HttpError {
  public errors?: { [key: string]: string[] };

  constructor(message: string, errors?: { [key: string]: string[] }) {
    super(400, message);
    this.errors = errors;
  }
}

export class NotFoundError extends HttpError {
  constructor(message?: string) {
    super(404, message || "Not Found");
  }
}

export class TooManyRequests extends HttpError {
  constructor(message?: string) {
    super(429, message || "Çok fazla istek alındı. Lütfen tekrar deneyiniz.");
  }
}
