import { DataSource } from 'typeorm';

import config from './utils/config';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.db.DB_HOST,
  port: config.db.DB_PORT,
  username: config.db.DB_USERNAME,
  password: config.db.DB_PASSWORD,
  database: config.db.DB_DBNAME,
  entities: ['src/entity/*.ts'],
  logging: true,
  synchronize: true,
});
