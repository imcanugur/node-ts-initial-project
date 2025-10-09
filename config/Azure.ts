import config from "config";
import { BlobServiceClient } from "@azure/storage-blob";
import { Error } from "@/responses/Errors";

export class Azure {
  private static instance: Azure;
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  private constructor() {
    const azureConfig = config.get<{
      storageAccount: string;
      storageKey: string;
      containerName: string;
    }>("azure");

    if (
      !azureConfig.storageAccount ||
      !azureConfig.storageKey ||
      !azureConfig.containerName
    ) {
      throw new Error(
        500,
        "Azure storage configuration is missing in config file.",
      );
    }

    const connectionString = `DefaultEndpointsProtocol=https;AccountName=${azureConfig.storageAccount};AccountKey=${azureConfig.storageKey};EndpointSuffix=core.windows.net`;

    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    this.containerName = azureConfig.containerName;
  }

  public static getInstance(): Azure {
    if (!Azure.instance) {
      Azure.instance = new Azure();
    }
    return Azure.instance;
  }

  public getBlobServiceClient(): BlobServiceClient {
    return this.blobServiceClient;
  }

  public getContainerName(): string {
    return this.containerName;
  }
}
