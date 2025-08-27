import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  Index,
} from "typeorm";
import { Exclude } from "class-transformer";

export abstract class Entity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Exclude()
  @Column({ default: true })
  status: boolean = true;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Exclude()
  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;
}
