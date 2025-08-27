import "reflect-metadata";
import { getMetadataArgsStorage } from "routing-controllers";
import { getDescription } from "../decorators/Description";
import { ControllerService } from "./ControllerService";
import { Service } from "typedi";

@Service()
export class DocumentationService {
  constructor(private readonly controllerService: ControllerService) {}
  private storage = getMetadataArgsStorage();

  public generateDocs(): Record<string, any> {
    const docs = this.controllerService.getControllersDocs();

    const controllers = Array.from(this.storage.controllers);
    controllers.sort((a, b) => a.target.name.localeCompare(b.target.name));

    const sortedDocs: Record<string, any> = {};

    for (const { target } of controllers) {
      const controllerName = target.name;
      if (controllerName !== "DashboardController") {
        const controllerDoc = docs[controllerName] || {
          description: "No description provided",
          baseUrl: "",
          functions: [],
        };
        this.processActions(target as Function, controllerDoc);
        sortedDocs[controllerName] = controllerDoc;
      }
    }

    return sortedDocs;
  }

  private processActions(target: Function, controllerDoc: any): void {
    const actions = Array.from(this.storage.actions).filter(
      (action) => action.target === target,
    );
    actions.sort((a, b) => {
      const methodComparison = a.method.localeCompare(b.method);
      if (methodComparison !== 0) return methodComparison;
      return a.route.toString().localeCompare(b.route.toString());
    });

    for (const action of actions) {
      const fullRoute = `${controllerDoc.baseUrl}${this.getRoutePath(action.route)}`;
      const parameters =
        Reflect.getMetadata(`parameters:${action.method}`, target.prototype) ||
        [];
      const methodDescription =
        getDescription(target.prototype, action.method) ||
        "No description provided";

      controllerDoc.functions.push({
        method: action.type,
        route: fullRoute,
        description: methodDescription,
        parameters: this.mapParameters(parameters),
      });
    }

    controllerDoc.functions.sort((a: any, b: any) =>
      a.route.localeCompare(b.route),
    );
  }

  private getRoutePath(route: RegExp | string): string {
    return route instanceof RegExp ? route.toString() : route;
  }

  private mapParameters(parameters: any[]): any[] {
    return parameters
      .map((param) => ({
        name: param.name,
        type: param.type,
        description: param.description || "No description provided",
        required: param.required,
        multiple: param.multiple,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
