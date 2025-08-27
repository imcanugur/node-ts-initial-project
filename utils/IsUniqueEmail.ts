import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { UserService } from "../services/UserService";
import { Service } from "typedi";

@ValidatorConstraint({ async: true })
@Service()
export class IsUniqueEmail implements ValidatorConstraintInterface {
  constructor(private userService: UserService) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);
    return !user;
  }

  defaultMessage(): string {
    return "Email address already exists.";
  }
}
