import {
  JsonController,
  Body,
  Post,
  HttpCode,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  Authorized,
  Get,
  Put,
  Delete,
  Param,
} from "routing-controllers";
import { Service, Container } from "typedi";
import { UserService } from "@/services/UserService";
import { Ok, Created } from "@/responses/Success";
import { BadRequestError } from "@/responses/Errors";
import { AuthService } from "@/services/AuthService";

@Service()
@Authorized()
@JsonController("/profile")
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get("/")
  @HttpCode(200)
  async profile(): Promise<any> {
    try {
      const login = await this.userService.findById(
        this.authService.getCurrentUser().id,
      );
      return new Ok(login);
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError
      ) {
        return new BadRequestError("Geçersiz e-posta adresi veya şifre.");
      }
      throw new InternalServerError("Beklenmeyen bir hata oluştu");
    }
  }

  @Put("/")
  @HttpCode(200)
  async update(
    @Body()
    body: {
      name?: string;
      email?: string;
      phone?: string;
      attributes?: any;
      image?: string;
      images?: string[];
    },
  ): Promise<any> {
    try {
      const userId = this.authService.getCurrentUser().id;

      const updatedUser = await this.userService.updateUser(
        userId,
        body.name,
        body.email,
        body.phone,
        body.attributes,
        body.images,
      );

      return new Ok(updatedUser);
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError
      ) {
        return new BadRequestError("Geçersiz e-posta adresi veya şifre.");
      }
      throw new InternalServerError(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.",
      );
    }
  }

  @Put("/change-password")
  @HttpCode(200)
  async changePassword(
    @Body() body: { old_password: string; new_password: string },
  ): Promise<any> {
    try {
      const userId = this.authService.getCurrentUser().id;

      if (!body.old_password || !body.new_password) {
        return new BadRequestError("Eski ve yeni şifre alanları zorunludur.");
      }

      const updatedUser = await this.userService.changePassword(
        userId,
        body.old_password,
        body.new_password,
      );

      return new Ok({ message: "Şifre başarıyla değiştirildi." });
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError
      ) {
        return new BadRequestError(error.message);
      }
      throw new InternalServerError(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.",
      );
    }
  }

  @Delete("/:id")
  @HttpCode(200)
  async deleteAccount(@Param("id") id: string): Promise<Ok> {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser.id !== id) {
      throw new UnauthorizedError("Bu işlemi yapmaya yetkiniz yok.");
    }

    try {
      await this.userService.removeAccount(id);
      return new Ok({ message: "Hesabınız başarıyla silindi." });
    } catch (err: any) {
      if (err instanceof NotFoundError) {
        throw new BadRequestError(err.message);
      }
      throw new InternalServerError(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.",
      );
    }
  }
}
