import { Context } from 'koa';

/**
 * 在app.use(router)之前调用
 */
 export function response_formatter() {
  return async (ctx: Context, next: () => Promise<void>) => {
    //先去执行路由
    await next();
    console.log('ctx', ctx);
    
    // swagger 文档不包装返回内容
    if (ctx.request.url.includes('/swagger-html')) return ctx.body;

    //如果有返回数据，将返回数据添加到data中
    if (ctx.body) {
      ctx.body = {
        code: 0,
        message: 'success',
        data: ctx.body,
      };
    } else {
      ctx.body = {
        code: 0,
        message: 'success',
      };
    }
  };
}
