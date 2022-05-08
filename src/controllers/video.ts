// src/controllers/video.ts
import { Context } from 'koa';

import { AppDataSource } from '../app-data-source';
import { NotFoundException, ForbiddenException } from '../exceptions';
// import { User } from '../entity/user';
import AgoraService from '../services/agora';
import { Friendship } from '../entity/friendship';
import { description, query, request, summary, tags } from 'koa-swagger-decorator';
import { In } from 'typeorm';

const tag = tags(['Video']);
// const userRepository = AppDataSource.getRepository(User);
const friendshipRepository = AppDataSource.getRepository(Friendship);
const agoraService = new AgoraService();

export default class VideoController {
  @request('get', '/video/genAccessTokenByChatRoomID')
  @summary('通过chatroomId，获取rtc token')
  @description('example of api')
  @tag
  @query({
    chatroomId: {
      type: 'string',
      required: true,
      default: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      description: 'chatroomId',
    },
  })
  public static async genAccessTokenByChatRoomID(ctx: Context) {
    const { chatroomId } = ctx.query;
    const { id: uid } = ctx.state.user;
    try {
      const token = await agoraService.generateRtcTokenByUid(uid, String(chatroomId));

      ctx.status = 200;
      ctx.success(token);
    } catch (error) {
      // throw new NotFoundException('get token fail');
      ctx.status = 404;
      return ctx.fail('get token fail');
    }
  }

  @request('get', '/video/getVideoChatRoomId')
  @summary('通过用户id，获取ChatRoomId')
  @description('example of api')
  @tag
  @query({
    dialogistId: { type: 'string', required: true, default: '1', description: 'dialogistId' },
  })
  public static async getVideoChatRoomId(ctx: Context) {
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

  @request('get', '/video/get256AESSecretAndSalt')
  @summary('通过用户channel id，获取密钥')
  @description('example of api')
  @tag
  @query({
    channelId: {
      type: 'string',
      required: true,
      default: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      description: 'channelId',
    },
  })
  public static async get256AESSecretAndSalt(ctx: Context) {
    const { channelId } = ctx.query;
    const secretAndSalt = agoraService.generate256AESSecretAndSalt(String(channelId));
    // ctx.body = secretAndSalt;
    ctx.success(secretAndSalt);
  }
}
