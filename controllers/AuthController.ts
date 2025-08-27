import {
  JsonController,
  Body,
  Post,
  HttpCode,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  Authorized,
  Put,
} from "routing-controllers";
import { Service } from "typedi";
import { UserService } from "@/services/UserService";
import {
  LoginRequest,
  RegisterRequest,
  RequestOtpRequest,
  VerifyOtpRequest,
} from "@/requests/AuthRequest";
import { LoginResponse, RegisterResponse } from "@/responses/AuthResponse";
import { Ok, Created } from "@/responses/Success";
import { BadRequestError } from "@/responses/Errors";
import {OpenAPI, ResponseSchema} from "routing-controllers-openapi";
import { ValidationError } from "xml2js";
import { AuthService } from "@/services/AuthService";

@Service()
@OpenAPI({
  summary: "Authentication and User Management",
  description: "Handles user login, registration, and management operations.",
})
@JsonController("/auth")
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post("/login")
  @HttpCode(200)
  @OpenAPI({
    summary: "User Login",
    description: "Logs in user and sends OTP to email",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: {
                type: "string",
                format: "email",
                example: "user@example.com"
              },
              password: {
                type: "string",
                example: "123456"
              }
            },
            required: ["email", "password"]
          }
        }
      }
    }
  })  async login(@Body() body: LoginRequest): Promise<any> {
    try {
      const { email, password } = body;

      const login = await this.userService.login(email, password);

      const response = await this.userService.requestOtp(login.user.email);
      return new Ok({
        reference: response.reference,
        message:
          "Giriş işlemini tamamlamak için e-posta adresinize doğrulama kodu gönderildi.",
      });
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError
      ) {
        return new BadRequestError("Email veya şifre yanlış");
      }

      throw new InternalServerError(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.",
      );
    }
  }

  @Post("/register")
  @OpenAPI({
    summary: "User Registration",
    description: "Registers a new user and sends an OTP to their email for verification.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/RegisterRequest" },
        },
      },
    },
    responses: {
      "201": {
        description: "Kullanıcı başarıyla kaydedildi ve OTP gönderildi.",
      },
      "400": {
        description: "Geçersiz kayıt isteği.",
      },
    },
  })
  @ResponseSchema(LoginResponse)
  @HttpCode(201)
  async register(@Body() body: RegisterRequest): Promise<any> {
    try {
      const { name, email, password, phone, role, attributes, images } =
        body;

      const existingUser = await this.userService.findByEmail(email);
      if (existingUser)
        return new BadRequestError(
          "Bu mail adresine ait bir kullanıcı zaten mevcut. Şifrenizi unuttuysanız Şifremi Unuttum ekranından güncelleyebilirsiniz.",
        );

      const existingUserByPhone = await this.userService.findByPhone(phone);
      if (existingUserByPhone)
        return new BadRequestError(
          "Bu telefon numarasına ait bir kullanıcı zaten mevcut. Şifrenizi unuttuysanız Şifremi Unuttum ekranından güncelleyebilirsiniz.",
        );

      await this.userService.register(
        role,
        name,
        email,
        phone,
        password,
        attributes ?? {},
        images ?? [],
      );

      const otpResult = await this.userService.requestOtp(email);

      return new Created({
        reference: otpResult.reference,
        message:
          "Kullanıcı başarıyla kaydedildi. Doğrulama için e-posta adresinize bir kod gönderildi.",
      });
    } catch (error: any) {
      console.error("❌ Kayıt sırasında bir hata oluştu:", error);

      if (error instanceof BadRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof ValidationError) {
        throw new BadRequestError("Doğrulama Hatası: " + error.message);
      }

      throw new InternalServerError(
        error.message ||
          "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.",
      );
    }
  }

  @Authorized()
  @Post("/status")
  @OpenAPI({
    summary: "Toggle User Status",
    description: "Toggles the active status of a user by email.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: { type: "string", format: "email" },
            },
            required: ["email"],
          },
        },
      },
    },
    responses: {
      "202": {
        description: "Kullanıcı durumu başarıyla değiştirildi.",
      },
      "400": {
        description: "Email adresi gerekli.",
      },
    },
  })
  @HttpCode(202)
  async toggleStatus(@Body() body: { email: string }): Promise<any> {
    try {
      if (!body.email) return new BadRequestError("Email is required");
      const status = await this.userService.toggleStatus(body.email);
      return new Ok({
        message: status
          ? "Kullanıcı başarıyla aktif edildi."
          : "Kullanıcı başarıyla deaktif edildi.",
      });
    } catch (error) {
      throw new InternalServerError(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.",
      );
    }
  }

  @Authorized()
  @Post("/clear-tokens")
  @OpenAPI({
    summary: "Clear User Tokens",
    description: "Clears all tokens for a user by email.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: { type: "string", format: "email" },
            },
            required: ["email"],
          },
        },
      },
    },
    responses: {
      "203": {
        description: "Token temizlemesi başarılı.",
      },
      "400": {
        description: "Email adresi gerekli.",
      },
    },
  })
  @HttpCode(203)
  async clearTokens(@Body() body: { email: string }): Promise<any> {
    try {
      if (!body.email) return new BadRequestError("Email adresi gerekli");
      await this.userService.clearToken(body.email);
      return new Ok({ message: "Token temizlemesi başarılı" });
    } catch (error) {
      throw new InternalServerError(
        "Token temizleme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyiniz.",
      );
    }
  }

  @Post("/request-otp")
  @OpenAPI({
    summary: "Request OTP",
    description: "Requests an OTP for the given email address.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/RequestOtpRequest" },
        },
      },
    },
    responses: {
      "200": {
        description: "OTP başarıyla gönderildi.",
      },
      "400": {
        description: "Geçersiz email adresi.",
      },
    },
  })
  @HttpCode(200)
  async requestOtp(@Body() body: RequestOtpRequest): Promise<any> {
    try {
      const response = await this.userService.requestOtp(body.email);
      return new Ok(response);
    } catch (error) {
      throw new InternalServerError(
        "Doğrulama kodu isteği başarısız oldu. Lütfen tekrar deneyiniz.",
      );
    }
  }

  @Post("/verify-otp")
  @OpenAPI({
    summary: "Verify OTP",
    description: "Verifies the OTP for the given email and reference.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/VerifyOtpRequest" },
        },
      },
    },
    responses: {
      "200": {
        description: "OTP doğrulaması başarılı, kullanıcı bilgileri döner.",
      },
      "400": {
        description: "Geçersiz OTP veya referans.",
      },
    },
  })
  @HttpCode(200)
  async verifyOtp(@Body() body: VerifyOtpRequest): Promise<any> {
    try {
      const login = await this.userService.verifyOtp(
        body.email,
        body.reference,
        body.code,
      );
      return new Ok(new LoginResponse(login.token, login.user));
    } catch (error) {
      throw new InternalServerError(
        "Doğrulama kodu isteği başarısız oldu. Lütfen tekrar deneyiniz.",
      );
    }
  }

  @Authorized()
  @Put("/reset-password")
  @OpenAPI({
    summary: "Reset Password",
    description: "Resets the user's password.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              new_password: { type: "string", minLength: 6 },
            },
            required: ["new_password"],
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Şifre başarıyla değiştirildi.",
      },
      "400": {
        description: "Geçersiz istek.",
      },
    },
  })
  @HttpCode(200)
  async resetPassword(@Body() body: { new_password: string }): Promise<any> {
    try {
      const userId = this.authService.getCurrentUser().id;

      const updatedUser = await this.userService.resetPassword(
        userId,
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
}
