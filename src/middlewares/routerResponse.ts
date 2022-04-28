import { Context } from "koa";

type TOption = {
  type?: string;
  code?: number;
  message?: string;
}

export function routerResponse(option: TOption = {}) {
  return async (ctx: Context, next: () => Promise<void>) => {
    
    ctx.success = (data: any) => {
      ctx.type = option.type || 'json';
      ctx.body = {
        code: option.code || 0,
        message: option.message || 'success',
        data: data,
      };
    };

    ctx.fail = (message: string, code: number) => {
      ctx.type = option.type || 'json';
      ctx.body = {
        code: code || option.code || -1,
        message: message || option.message || 'fail',
      };
    };

    await next();
  };
}
