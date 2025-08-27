import { JsonController, Get, Authorized } from "routing-controllers";
import { Service } from "typedi";
import { DocumentationService } from "../services/DocumentationService";
import { Ok } from "../responses/Success";

@Service()
@Authorized()
@JsonController("/dashboard")
export class DashboardController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Get("/docs")
  public getDocs(): Record<string, any> {
    return new Ok(this.documentationService.generateDocs());
  }
}
