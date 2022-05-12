const config = {
  app: {
    APP_PORT: process.env.APP_PORT,
  },
  db: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: Number(process.env.DB_PORT),
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DBNAME: process.env.DB_DBNAME,
  }
}

export default config;
