import config from "config";
import winston from "winston";
import "winston-daily-rotate-file";

export class Logger {
  private logger: winston.Logger;
  private env: string;
  private config: {
    logFile: string;
    datePattern: string;
    zippedArchive: boolean;
    maxSize: string;
    maxFiles: string;
  };

  constructor() {
    this.env = config.get("app.env");
    this.config = config.get("app.logger") as {
      logFile: string;
      datePattern: string;
      zippedArchive: boolean;
      maxSize: string;
      maxFiles: string;
    };

    const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
      filename: this.config.logFile,
      datePattern: this.config.datePattern,
      zippedArchive: this.config.zippedArchive,
      maxSize: this.config.maxSize,
      maxFiles: this.config.maxFiles,
    });

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [dailyRotateFileTransport],
    });

    if (this.env !== "production") {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      );
    }
  }

  public error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }

  public info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }
}
