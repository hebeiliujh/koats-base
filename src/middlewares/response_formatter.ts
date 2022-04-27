import { Context } from 'koa';

/**
 * 在app.use(router)之前调用
 */
 export function response_formatter() {
  return async (ctx: Context, next: () => Promise<void>) => {
    //先去执行路由
    await next();

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
