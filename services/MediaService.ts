import { Service } from "typedi";
import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
} from "@azure/storage-blob";
import { Azure } from "@/config/Azure";

@Service()
export class MediaService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor() {
    const azureConfig = Azure.getInstance();
    this.blobServiceClient = azureConfig.getBlobServiceClient();
    this.containerClient = this.blobServiceClient.getContainerClient(
      azureConfig.getContainerName(),
    );
  }

  public async uploadFile(
    blobName: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    const blockBlobClient: BlockBlobClient =
      this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    console.log(`File uploaded successfully: ${blobName}`);
    return blockBlobClient.url;
  }

  public async listFiles(): Promise<string[]> {
    let files: string[] = [];
    for await (const blob of this.containerClient.listBlobsFlat()) {
      files.push(blob.name);
    }
    return files;
  }

  public async deleteFile(blobName: string): Promise<void> {
    const blockBlobClient: BlockBlobClient =
      this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    console.log(`File deleted: ${blobName}`);
  }
}
