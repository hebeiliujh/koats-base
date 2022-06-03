// src/controllers/message.ts
import { Context } from 'koa';
import { body, description, query, request, summary, tags } from 'koa-swagger-decorator';
import { Message } from '../entity/message';
import { AppDataSource } from '../app-data-source';

import { NotFoundException } from '../exceptions';
import AgoraService from '../services/agora';
import { handlePages } from '../utils/pagination';
import { Friendship } from '../entity/friendship';
import { In } from 'typeorm';

const messageRepository = AppDataSource.getRepository(Message);
const friendshipRepository = AppDataSource.getRepository(Friendship);

const tag = tags(['Message']);
const agoraService = new AgoraService();
const paginationSchema = {
  page: { type: 'number', required: false },
  size: { type: 'number', required: false },
};
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

  @request('get', '/message/getMessageHistory')
  @summary('获取历史消息')
  @description('example of api')
  @tag
  @query({
    conversationId: { type: 'string', required: true, default: '2ddab9de-db9f-4ddf-9765-d2843ec96c2e', description: 'conversationId' },
    ...paginationSchema
  })
  public static async getMessageHistory(ctx: Context) {
    let { page, size, conversationId } = ctx.query;

    // const _page = page ? Number(page) : 1;
    // const _size = size ? Number(size) : 20;
    // const skip: number = (_page - 1) * _size;

    const [messages, count] = await messageRepository.findAndCount({
      where: {
        conversationId: String(conversationId)
      },
      // take: _size,
      // skip,
      relations: {
        user: true,
      },
    });

    ctx.status = 200;
    ctx.success({
      data: messages,
      ...handlePages(1, count, count),
    });
  }

  @request('get', '/message/getChatRoomId')
  @summary('通过用户id，获取ChatRoomId')
  @description('example of api')
  @tag
  @query({
    dialogistId: { type: 'string', required: true, default: '1', description: 'dialogistId' },
  })
  public static async getChatRoomId(ctx: Context) {
    const { dialogistId } = ctx.query;
    const { id: uid } = ctx.state.user;

    if (dialogistId?.includes(',')) {
      const dialogistIds = (dialogistId as string).split(',').map(id => Number(id));
      const friendships = await friendshipRepository.find({
        where: {
          userId: uid,
          friendId: In(dialogistIds)
        }
      });
      return ctx.success(friendships);
    }

    const friendship = await friendshipRepository.findOne({
      where: {
        userId: uid,
        friendId: Number(dialogistId)
      }
    });

    if (!friendship) {
      // throw new NotFoundException("Friendship not found");
      ctx.status = 404;
      return ctx.fail('Friendship not found');
    }
    // ctx.body = friendship;
    ctx.success(friendship);
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

  @request('post', '/message/addMessageRecord')
  @summary('添加消息')
  @description('example of api')
  @tag
  @body({
    conversationId: { type: 'string', required: true, default: '2ddab9de-db9f-4ddf-9765-d2843ec96c2e', description: 'conversationId' },
    messageText: { type: 'string', required: true, default: 'Hi', description: 'messageText' },
  })
  public static async inviteFriend(ctx: Context) {
    let { conversationId, messageText } = ctx.request.body;
    const { id: uid } = ctx.state.user;
    const timestamp = Date.now();

    const message = new Message();
    message.userId = uid;
    message.message = messageText;
    message.timestamp = timestamp;
    message.conversationId = conversationId;
    const result = await messageRepository.save(message);

    ctx.status = 200;
    ctx.success({...result, user: { id: uid }});
  }
}
