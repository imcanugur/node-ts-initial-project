import "reflect-metadata";
import { getMetadataArgsStorage } from "routing-controllers";
import { getDescription } from "../decorators/Description";
import { Service } from "typedi";

@Service()
export class ControllerService {
  private storage = getMetadataArgsStorage();

  public getControllersDocs(): Record<string, any> {
    const docs: Record<string, any> = {};

    for (const { target, route } of this.storage.controllers) {
      const controllerName = target.name;
      if (controllerName !== "DashboardController") {
        docs[controllerName] = this.createControllerDoc(target, route);
      }
    }
    return docs;
  }

  private createControllerDoc(
    target: Function,
    route: string | undefined,
  ): any {
    return {
      description: getDescription(target) || "Açıklama sağlanmadı.",
      baseUrl: route || "",
      functions: [],
    };
  }
}
