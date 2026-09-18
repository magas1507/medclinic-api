import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { User } from "../entities/User";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",

  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_DATABASE as string,

  synchronize: true,
  uuidExtension: "pgcrypto",
  logging: false,

  entities: [User],
});