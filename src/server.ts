import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import koaBody from 'koa-body';
import koaStatic from 'koa-static';
import jwt from 'koa-jwt';
import 'reflect-metadata';
import { join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { AppDataSource } from './app-data-source';
// import { protectedRouter, unprotectedRouter } from './routes';
import swaggerRouter from './routes/swagger';
import { logger } from './logger';
import { JWT_SECRET } from './constants';
// import { response_formatter } from './middlewares/response_formatter';
import { routerResponse } from './middlewares/routerResponse';

import config from './utils/config';

// establish database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

// 初始化 Koa 应用实例
const app = new Koa();

app.use(routerResponse());
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    let message = err.message;
    const code = ctx.status;

    if(err.status === 401){
      ctx.status = 401;
      message = 'Protected resource, use Authorization header to get access';
    }
    ctx.fail(message, code);
  }
});

// 注册中间件
app.use(logger());
app.use(cors());
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200*1024*1024, // 设置上传文件大小最大限制，默认2M
    // 上传目录
    uploadDir: join(__dirname, '../public/images'),
    // 保留文件扩展名
    keepExtensions: true,
  }
}));
app.use(koaStatic(join(__dirname, '../public')));
app.use(bodyParser());
app.use(jwt({ secret: JWT_SECRET }).unless({
  path: [/^\/auth\/login/, /^\/auth\/register/, /^\/common\/upload/, /^\/swagger/, /^\/public/]
})); // swagger作为路由必须也排除在外
app.use(swaggerRouter.routes());
app.use(swaggerRouter.allowedMethods());

// 响应用户请求
// 无需 JWT Token 即可访问
// app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods());

// 注册 JWT 中间件
// app.use(jwt({ secret: JWT_SECRET }).unless({ method: 'GET' }));
// app.use(jwt({ secret: JWT_SECRET }));

// 需要 JWT Token 才可访问
// app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods());

// 运行服务器
app.listen(config.app.APP_PORT);

console.log(`Server start at port: ${config.app.APP_PORT}`);
