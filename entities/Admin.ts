import { Exclude } from "class-transformer";
import {
  Entity as TypeOrmEntity,
  Column,
  Index,
} from "typeorm";
import { Entity } from "@/entities";
import {UserRole} from "@/constants/UserRole";

@TypeOrmEntity("admin")
@Index("idx_admin_email", ["email"], { unique: true })
@Index("idx_admin_phone", ["phone"], { unique: true })
@Index("idx_admin_status", ["status"])
export class Admin extends Entity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column("jsonb", { nullable: true })
  @Index("idx_user_attributes", { synchronize: false })
  attributes?: Record<string, any>;

  constructor(
    name: string,
    email: string,
    phone: string,
    password: string,
    status: boolean,
    attributes?: Record<string, any>,
  ) {
    super();
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.status = status;
    this.role = UserRole.ADMIN;
    this.attributes = attributes ?? {};
  }
}
