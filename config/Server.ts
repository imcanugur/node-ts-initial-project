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
import nunjucks from "nunjucks";
import path from "path";
import {respond} from "@/utils/respond";

useContainer(Container);

class Server {
  private app: express.Application;

  private initializeMiddlewares: Array<any> = [
    koaCors(),
    koaHelmet(),
    koaBodyParser(),
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

    this.configureViews();

    this.app.get("/", (req, res, next) => {
      try {
        res.render("index", { status: true });
      } catch (error) {
        next(error);
      }
    });

    this.app.use((err: any, req: any, res: any, next: any) => {
      const handler = Container.get(HttpErrorHandler);
      handler.error( err, req, res, next ).then( r  => r );
    });
    this.app.use((req, res) => respond(res, 404, "Not Found"));
  }

  private setupSwagger() {
    const swagger = new Swagger(this.app);
    swagger.setupSwaggerUI();
  }

  private configureViews() {
    nunjucks.configure(path.join(__dirname, "../views"), {
      autoescape: true,
      express: this.app,
      watch: process.env.NODE_ENV !== "production",
    });
    this.app.set("view engine", "njk");
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
