import { getMetadataArgsStorage } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
import config from "config";
import { Application } from "express";

class Swagger {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  private generateSpec() {
    const storage = getMetadataArgsStorage();
    return routingControllersToSpec(
      storage,
      {
        validation: true,
        classTransformer: true,
      },
      {
        info: {
          title: "API",
          version: "1.0.0",
          description: "API Docs",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
        security: [{ bearerAuth: [] }],
        servers: [
          {
            url: `http://localhost:${config.get("app.port")}/services`,
            description: "Local Server",
          },
        ],
      },
    );
  }

  public setupSwaggerUI() {
    const spec = this.generateSpec();
    this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
    console.log(
      `📄 Swagger UI: http://localhost:${config.get("app.port")}/docs`,
    );
  }
}

export default Swagger;
