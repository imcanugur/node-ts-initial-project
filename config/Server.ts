import "reflect-metadata";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createExpressServer, useContainer } from "routing-controllers";
import config from "config";
import Container from "typedi";
import { HttpErrorHandler } from "@/middlewares/HttpErrorHandler";
import helmet from "helmet";
import { RateLimiterMiddleware } from "@/middlewares/RateLimiterMiddleware";
import { AuthMiddleware } from "@/middlewares/AuthMiddleware";
import koaHelmet from "koa-helmet";
import koaCors from "@koa/cors";
import koaBodyParser from "koa-bodyparser";
import Swagger from "@/config/Swagger";
import {
  AuthController,
  DashboardController,
  ProfileController,
  MediaController,
} from "@/controllers";
import { HostGuard } from "@/middlewares/HostGuard";
useContainer(Container);

class Server {
  private app: express.Application;

  private initializeMiddlewares: Array<any> = [
    koaCors(),
    koaHelmet(),
    koaBodyParser(),
    HttpErrorHandler,
    RateLimiterMiddleware,
    cors(),
    helmet(),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    HttpErrorHandler,
    RateLimiterMiddleware,
  ];

  private initializeControllers: Array<any> = [
    AuthController,
    DashboardController,
    ProfileController,
    MediaController,
  ];

  constructor() {
    this.app = createExpressServer({
      cors: true,
      classTransformer: true,
      authorizationChecker: (action, roles) => AuthMiddleware(action, roles),
      routePrefix: "/services",
      defaultErrorHandler: false,
      validation: {
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      },
      middlewares: this.initializeMiddlewares,
      controllers: this.initializeControllers,
    });

    this.app.use(HostGuard);

    this.app.get("/", (req, res) => {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Silence</title>
            <link rel="preconnect" href="https://fonts.bunny.net">
            <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    font-family: Figtree, sans-serif;
                    background-color: black;
                    color: white;
                    text-align: center;
                }
                h1 {
                    font-size: 2rem;
                    font-weight: 400;
                }
            </style>
        </head>
        <body>
            <h1>Silence is golden!</h1>
        </body>
        </html>
      `);
    });
  }

  private setupSwagger() {
    const swagger = new Swagger(this.app);
    swagger.setupSwaggerUI();
  }

  public start(): void {
    const PORT = config.get("app.port");
    this.app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
      this.setupSwagger();
    });
  }
}

export default new Server();
