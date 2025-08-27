import { Exclude } from "class-transformer";
import {
  Entity as TypeOrmEntity,
  Column,
  Index,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import { UserRole } from "@/constants/UserRole";
import { Entity } from "@/entities";
import Database from "@/config/Database";

@TypeOrmEntity("users")
@Index("idx_user_email", ["email"], { unique: true })
@Index("idx_user_phone", ["phone"], { unique: true })
@Index("idx_user_status", ["status"])
export class User extends Entity {
  @Column("jsonb", { nullable: true })
  images?: string[];

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Exclude()
  @Column()
  password: string;

  @Column("jsonb", { nullable: true })
  @Index("idx_user_attributes", { synchronize: false })
  attributes?: Record<string, any>;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: "float", nullable: true })
  rating!: number;

  @Column({ type: "varchar", unique: true, nullable: true })
  userCode!: string;

  @BeforeInsert()
  async generateUserCode() {
    if (!this.userCode) {
      const repo = Database.dataSource.getRepository(User);
      let unique = false;
      let code = "";
      while (!unique) {
        code = Math.floor(10000000 + Math.random() * 90000000).toString();
        const exists = await repo.findOne({ where: { userCode: code } });
        if (!exists) unique = true;
      }
      this.userCode = code;
    }
  }

  constructor(
    name: string,
    email: string,
    phone: string,
    password: string,
    status: boolean,
    role: UserRole = UserRole.USER,
    attributes?: Record<string, any>,
    images?: string[],
  ) {
    super();
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.status = status;
    this.role = role;
    this.attributes = attributes ?? {};
    this.images = images ?? [];
  }
}
