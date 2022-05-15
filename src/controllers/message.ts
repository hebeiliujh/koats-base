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
      ctx.success({ token });
    } catch (error) {
      // throw new NotFoundException("get token fail");
      ctx.status = 404;
      ctx.fail('get token fail');
    }
  }

  // @request('get', '/message/getConversationId')
  // @summary('通过用户id，获取ConversationId')
  // @description('example of api')
  // @tag
  // @query({
  //   dialogistId: { type: 'string', required: true, default: '1', description: 'dialogistId' },
  // })
  // public static async getConversationId(ctx: Context) {
  //   const { dialogistId } = ctx.query;
  //   const { id: uid } = ctx.state.user;

  //   if (dialogistId?.includes(',')) {
  //     const dialogistIds = (dialogistId as string).split(',').map(id => Number(id));
  //     const friendships = await friendshipRepository.find({
  //       where: {
  //         userId: uid,
  //         friendId: In(dialogistIds)
  //       }
  //     });
  //     return ctx.success(friendships);
  //   }

  //   const friendship = await friendshipRepository.findOne({
  //     where: {
  //       userId: uid,
  //       friendId: Number(dialogistId)
  //     }
  //   });

  //   if (!friendship) {
  //     // throw new NotFoundException("Friendship not found");
  //     ctx.status = 404;
  //     return ctx.fail('Friendship not found');
  //   }
  //   // ctx.body = friendship;
  //   ctx.success(friendship);
  // }
}
