import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Beer } from '../entities/Beer';
import path from 'path';
import 'reflect-metadata';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  entities: [User, Beer],
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  migrationsRun: false,
  synchronize: true,
  logging: false,
  logger: 'simple-console',
});
