import { UserRole } from "@/constants/UserRole";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { OpenAPI } from "routing-controllers-openapi";

@OpenAPI({ description: "Login Request Schema" })
export class LoginRequest {
  @IsEmail(
    {},
    {
      message:
        "Geçersiz mail adresi girdiniz. Lütfen kontrol edip tekrar deneyiniz.",
    },
  )
  @IsNotEmpty({ message: "Email alanının doldurulması zorunludur." })
  email!: string;

  @IsString({ message: "Şifre alanının doldurulması zorunludur." })
  password!: string;
}

@OpenAPI({ description: "Register request schema" })
export class RegisterRequest {
  @IsEnum(UserRole, { message: "Role must be 'repairman'" })
  role!: UserRole;

  @IsString()
  @IsNotEmpty({ message: "İsim alanının doldurulması zorunludur." })
  name!: string;

  @IsEmail(
    {},
    {
      message:
        "Geçersiz mail adresi girdiniz. Lütfen kontrol edip tekrar deneyiniz.",
    },
  )
  @IsNotEmpty({ message: "Email alanının doldurulması zorunludur." })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Telefon numarası alanının doldurulması zorunludur." })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: "Şifre alanının doldurulması zorunludur." })
  password!: string;

  @IsOptional()
  @IsObject({ message: "Özellikler nesne olmalıdır" })
  attributes?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: "Tüm images elemanları string olmalı" })
  images?: string[];
}

export class RequestOtpRequest {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class VerifyOtpRequest {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  reference!: string;

  @IsString()
  @Length(6, 6, { message: "OTP kodu 6 haneli olmalı" })
  code!: string;
}
