import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "config";
import { User } from "@/entities";
import { Container } from "typedi";

class Database {
  public static dataSource: DataSource;

  public static async connect(): Promise<void> {
    try {
      const db = config.get("db") as {
        type: string;
        host: string;
        port: number;
        name: string;
        username: string;
        password: string;
        synchronize: boolean;
        logging: boolean;
        ssl: boolean;
      };

      this.dataSource = new DataSource({
        type: db.type as "postgres",
        host: db.host,
        port: db.port,
        database: db.name,
        username: db.username,
        password: db.password,
        synchronize: db.synchronize,
        logging: db.logging,
        ssl: db.ssl,

        entities: [User],
      });

      await this.dataSource.initialize();
      Container.set(DataSource, this.dataSource);

      console.log("TypeORM connected");
    } catch (error) {
      console.error("TypeORM connection error:", error);
    }
  }
}

export default Database;
