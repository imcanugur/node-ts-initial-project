import { Expose, plainToInstance } from "class-transformer";
import { User } from "@/entities/User";

export class LoginResponse {
  token: string;
  user: Omit<User, "password">;

  constructor(token: string, user: Omit<User, "password">) {
    this.token = token;
    this.user = user;
  }
}

export class RegisterResponse {
  token: string;
  @Expose()
  user: Omit<User, "password"> & { generateUserCode?: any };

  constructor(token: string, user: Omit<User, "password">) {
    this.token = token;
    this.user = plainToInstance(User, user);
  }
}
