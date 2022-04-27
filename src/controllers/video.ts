// src/controllers/video.ts
import { Context } from 'koa';

import { AppDataSource } from '../app-data-source';
import { NotFoundException, ForbiddenException } from '../exceptions';
import { User } from '../entity/user';
import VideoService from '../services/video';
import { Friendship } from '../entity/friendship';

const userRepository = AppDataSource.getRepository(User);
const friendshipRepository = AppDataSource.getRepository(Friendship);
const videoService = new VideoService();

export default class VideoController {
  public static async genAccessTokenByChatRoomID(ctx: Context) {
    const { chatroomId } = ctx.params;
    const { id: uid } = ctx.state.user;
    try {
      const token = await videoService.generateTokenByUid(uid, chatroomId);
  
      ctx.status = 200;
      ctx.body = { token };
    } catch (error) {
      throw new NotFoundException("get token fail");
    }
  }

  public static async getVideoChatRoomId(ctx: Context) {
    const { dialogistId } = ctx.params;
    const friendship = await friendshipRepository.findOneBy({ userId: Number(dialogistId) })
    
    if (!friendship) {
      throw new NotFoundException("Friendship not found");
    }
    ctx.body = friendship;
  }

  public static async get256AESSecretAndSalt(ctx: Context) {
    const { channelId } = ctx.params;
    const secretAndSalt = videoService.generate256AESSecretAndSalt(channelId);
    ctx.body = secretAndSalt;
  }
}
