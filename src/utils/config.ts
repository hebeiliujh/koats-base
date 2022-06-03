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
  },
  qiniu: {
    QINIU_ACCESS_KEY: process.env.QINIU_ACCESS_KEY,
    QINIU_SECRET_KEY: process.env.QINIU_SECRET_KEY,
    QINIU_SCOPE: process.env.QINIU_SCOPE,
    QINIU_DOMAIN: process.env.QINIU_DOMAIN,
  },
  agoraConfig: {
    appId: process.env.AGORA_APP_ID,
    appCertificate: process.env.AGORA_APP_CERTIFICATE,
  }
}

export default config;
