import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'Sql@123456',
  database: 'koats',
  entities: ['src/entity/*.ts'],
  logging: true,
  synchronize: true,
});
