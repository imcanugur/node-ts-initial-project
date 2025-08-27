import { Service } from "typedi";
import {
  JsonController,
  Post,
  Get,
  Delete,
  Req,
  Res,
  Authorized,
} from "routing-controllers";
import { Response, Request } from "express";
import { MediaService } from "@/services/MediaService";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { OpenAPI } from "routing-controllers-openapi";

@Service()
@Authorized()
@JsonController("/media")
export class MediaController {
  private upload: multer.Multer;

  constructor(
    private readonly mediaService: MediaService,
  ) {
    this.upload = multer({ storage: multer.memoryStorage() });
  }

  @Post("/")
  async uploadFiles(@Req() req: Request, @Res() res: Response) {
    return new Promise((resolve, reject) => {
      this.upload.array("files", 10)(req, res, async (err: any) => {
        if (err) {
          return { message: err.message };
        }

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return {
            message: "Hiçbir dosya yüklenmedi.  Lütfen tekrar deneyiniz.",
          };
        }

        try {
          // const uploadResults = await Promise.all(
          //     files.map((file) => this.mediaService.uploadFile(file.originalname, file.buffer, file.mimetype))
          // );

          const uploadResults = await Promise.all(
            files.map((file) => {
              const ext = path.extname(file.originalname);
              const uniqueFileName = `${uuidv4()}${ext}`;
              const userFolder = `${uniqueFileName}`;
              return this.mediaService.uploadFile(
                userFolder,
                file.buffer,
                file.mimetype,
              );
            }),
          );

          res.json({ uploadedFiles: uploadResults });
        } catch (error: any) {
          res.status(500).json({
            message:
              "Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyiniz.",
          });
        }
      });
    });
  }

  @Get("/")
  async listFiles(@Res() res: Response) {
    try {
      const files = await this.mediaService.listFiles();
      return { files };
    } catch (error: any) {
      return { message: error.message };
    }
  }

  @Delete("/:filePath(*)")
  @OpenAPI({ hidden: true })
  async deleteFile(@Req() req: Request, @Res() res: Response) {
    try {
      const filePath = req.originalUrl.replace(/.*\/media\//, "");
      const decodedFilePath = decodeURIComponent(filePath);

      if (!decodedFilePath) {
        return { message: "Dosya yolu gerekli." };
      }

      await this.mediaService.deleteFile(decodedFilePath);

      return res.json({
        message: "Dosya yolu silindi.",
        file: decodedFilePath,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // @Delete("/:fileName")
  // async deleteFile(@Req() req: Request, @Param("fileName") fileName: string, @Res() res: Response) {
  //     try {
  //         await this.mediaService.deleteFile(fileName);
  //         return res.json({ message: "File deleted successfully" });
  //     } catch (error: any) {
  //         return res.status(500).json({ message: error.message });
  //     }
  // }
}
