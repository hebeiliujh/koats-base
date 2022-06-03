// src/controllers/common.ts
import { Context } from 'koa';
import { description, request, summary, tags } from 'koa-swagger-decorator';
import QiniuService from '../services/qiniu';
import config from '../utils/config';

const qiniuService = new QiniuService();

const tag = tags(['Common']);
export default class CommonController {
  @request('post', '/common/upload-local')
  @summary('上传')
  @description('example of api')
  @tag
  public static async upload(ctx: Context) {
    try {
      const file: any = ctx.request.files?.file; // 上传的文件在ctx.request.files.file

      ctx.status = 200;
      ctx.success({
        url: `http://localhost:4400/images/${file.newFilename}`,
      });
    } catch (error) {
      ctx.status = 404;
      return ctx.fail('upload file fail');
    }
  }

  @request('post', '/common/upload')
  @summary('上传')
  @description('example of api')
  @tag
  public static async uploadToQiniu(ctx: Context) {
    try {
      const file: any = ctx.request.files?.file; // 上传的文件在ctx.request.files.file

      const uploadRes: any = await qiniuService.uploadFile(file.filepath, file.newFilename);

      ctx.status = 200;
      ctx.success({
        url: `${config.qiniu.QINIU_DOMAIN}/${uploadRes.key}`
      });
    } catch (error) {
      ctx.status = 404;
      return ctx.fail('upload file fail');
    }
  }
}
