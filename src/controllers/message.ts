// src/controllers/message.ts
import { Context } from 'koa';
import { description, query, request, summary, tags } from 'koa-swagger-decorator';

import { NotFoundException } from '../exceptions';
import AgoraService from '../services/agora';

const tag = tags(['Message']);
const agoraService = new AgoraService();

export default class MessageController {
  @request('get', '/message/genAccessToken')
  @summary('获取rtc token')
  @description('example of api')
  @tag
  public static async genAccessTokenByAccount(ctx: Context) {
    const { id: uid } = ctx.state.user;
    try {
      const token = await agoraService.generateRtmTokenByAccount(String(uid));

      ctx.status = 200;
      // ctx.body = { token };
      ctx.success(token);
    } catch (error) {
      // throw new NotFoundException("get token fail");
      ctx.status = 404;
      ctx.fail('get token fail');
    }
  }
}
