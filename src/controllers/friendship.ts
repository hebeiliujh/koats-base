// src/controllers/friendship.ts
import { Context } from 'koa';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';
import dayjs from 'dayjs';
import { body, description, query, request, summary, tags } from 'koa-swagger-decorator';
import { In } from 'typeorm';

import { AppDataSource } from '../app-data-source';
import { NotFoundException } from '../exceptions';
import FriendshipService from '../services/friendship';
import BlacklistService from '../services/blacklist';
import DataVersionService from '../services/dataVersion';
import { User } from '../entity/user';
import { Friendship } from '../entity/friendship';
import { Blacklist } from '../entity/blacklist';
// import { filterXss } from '../utils/utils';

const tag = tags(['Friendship']);
const friendshipSchema = {
  friendId: { type: 'number', required: true },
  message: { type: 'string', required: false },
};
const paginationSchema = {
  page: { type: 'number', required: false },
  size: { type: 'number', required: false },
};

const FRIENDSHIP_REQUESTING = 10;
const FRIENDSHIP_REQUESTED = 11;
const FRIENDSHIP_AGREED = 20;
const FRIENDSHIP_IGNORED = 21;
const FRIENDSHIP_DELETED = 30;
const FRIENDSHIP_PULLEDBLACK = 31;
// const FRIEND_REQUEST_MESSAGE_MIN_LENGTH = 0;
// const FRIEND_REQUEST_MESSAGE_MAX_LENGTH = 64;
// const FRIEND_DISPLAY_NAME_MIN_LENGTH = 1;
// const FRIEND_DISPLAY_NAME_MAX_LENGTH = 32;
// const CONTACT_OPERATION_ACCEPT_RESPONSE = 'AcceptResponse';
// const CONTACT_OPERATION_REQUEST = 'Request';

const userRepository = AppDataSource.getRepository(User);
const friendshipRepository = AppDataSource.getRepository(Friendship);
const blacklistRepository = AppDataSource.getRepository(Blacklist);
const friendshipService = new FriendshipService();
const blacklistService = new BlacklistService();
const dataVersionService = new DataVersionService();
const entityManager = AppDataSource.manager;

const removeBlackListPerson = function (currentUserId: string, friendId: any) {
  return new Promise(function (resolve, reject) {
    resolve(1);
    // return rongCloud.user.blacklist.remove(
    //   Utility.encodeId(currentUserId),
    //   Utility.encodeId(friendId),
    //   function (err, resultText) {
    //     return rongCloud.user.blacklist.remove(
    //       Utility.encodeId(friendId),
    //       Utility.encodeId(currentUserId),
    //       function (err, resultText) {
    //         return Blacklist.update(
    //           {
    //             status: false,
    //           },
    //           {
    //             where: {
    //               userId: { $in: [currentUserId, friendId] },
    //               friendId: { $in: [friendId, currentUserId] },
    //             },
    //           },
    //         )
    //           .then(function (result) {
    //             console.log('removeBlackListPerson', result);
    //             Cache.del('user_blacklist_' + currentUserId);
    //             resolve(result);
    //           })
    //           .catch(function (err) {
    //             reject(err);
    //           });
    //       },
    //     );
    //   },
    // );
  });
};

const sendContactNotification = function (
  userId: any,
  nickname: any,
  friendId: any,
  operation: any,
  message: any,
  timestamp: any,
) {
  let contactNotificationMessage, encodedFriendId, encodedUserId;
  // encodedUserId = Utility.encodeId(userId);
  // encodedFriendId = Utility.encodeId(friendId);
  contactNotificationMessage = {
    operation: operation,
    sourceUserId: encodedUserId,
    targetUserId: encodedFriendId,
    message: message,
    extra: {
      sourceUserNickname: nickname,
      version: timestamp,
    },
  };
  contactNotificationMessage = JSON.stringify(contactNotificationMessage);
  // Utility.log('Sending ContactNotificationMessage:', JSON.stringify(contactNotificationMessage));
  // return rongCloud.message.system.publish(encodedUserId, [encodedFriendId], 'ST:ContactNtf', contactNotificationMessage, function(err, resultText) {
  //   if (err) {
  //     return Utility.logError('Error: send contact notification failed: %j', err);
  //   }
  // });
};

export default class FriendController {
  @request('post', '/friendship/invite')
  @summary('添加好友')
  @description('example of api')
  @tag
  @body(friendshipSchema)
  public static async inviteFriend(ctx: Context) {
    let { friendId, message } = ctx.request.body;
    const errors = await validate(Friendship);
    if (errors.length) {
      throw new Error(`Validation failed!`);
    }

    const { id: currentUserId } = ctx.state.user;
    const timestamp = Date.now();

    const friend = await userRepository.findOneBy({ id: friendId });

    if (!friend) {
      throw new NotFoundException('User not found');
    }

    const channleName = uuidv4();

    if (friend.friVerify === 1) {
      let action: string,
        blacklist: Blacklist | null,
        fd: Friendship | null,
        fdStatus: number,
        fg: Friendship | null,
        fgStatus: number,
        resultMessage: string,
        unit;
      [fg, fd, blacklist] = await Promise.all([
        friendshipService.getInfo(currentUserId, friendId),
        friendshipService.getInfo(friendId, currentUserId),
        blacklistService.getInfo(friendId, currentUserId),
      ]);
      if (blacklist && blacklist.status && fg?.status == FRIENDSHIP_PULLEDBLACK) {
        // 不给只加入黑名单的人发送邀请消息
        // Utility.log('Invite result: %s %s', 'None: blacklisted by friend', 'Do nothing.');
        return ctx.success({
          message: 'Do nothing.',
          action: 'None',
        });
      }
      action = 'Added';
      resultMessage = 'Friend added.';
      console.log('fg && fd', fg && fd);
      if (fg && fd) {
        if (fg.status === FRIENDSHIP_AGREED && fd.status === FRIENDSHIP_AGREED) {
          ctx.status = 400;
          return ctx.fail({
            message: `User ${friendId} is already your friend.`,
          });
        }

        if (ctx.app.env === 'development') {
          unit = 's';
        } else {
          unit = 'd';
        }

        if (fd.status === FRIENDSHIP_REQUESTING) {
          fgStatus = FRIENDSHIP_AGREED;
          fdStatus = FRIENDSHIP_AGREED;
          message = fd.message;
        } else if (fd.status === FRIENDSHIP_AGREED) {
          fgStatus = FRIENDSHIP_AGREED;
          fdStatus = FRIENDSHIP_AGREED;
          message = fd.message;
          // timestamp = fd.timestamp;
        } else if (
          (fg.status === FRIENDSHIP_DELETED && fd.status === FRIENDSHIP_DELETED) ||
          (fg.status === FRIENDSHIP_AGREED && fd.status === FRIENDSHIP_DELETED) ||
          (fg.status === FRIENDSHIP_REQUESTING &&
            fd.status === FRIENDSHIP_IGNORED &&
            dayjs().subtract(1, unit).isAfter(fg.updatedDate)) ||
          (fg.status === FRIENDSHIP_REQUESTING &&
            fd.status === FRIENDSHIP_REQUESTED &&
            dayjs().subtract(3, unit).isAfter(fg.updatedDate))
        ) {
          fgStatus = FRIENDSHIP_REQUESTING;
          fdStatus = FRIENDSHIP_REQUESTED;
          action = 'Sent';
          resultMessage = 'Request sent.';
        } else {
          // Do nothing.;
          return ctx.success({
            action: 'None',
            message: 'Do nothing.',
          });
        }

        console.log('[fg]', fg);
        console.log('[fd]', fd);

        await entityManager
          .transaction(async (transactionalEntityManager) => {
            await Promise.all([
              await transactionalEntityManager.update(
                Friendship,
                {
                  id: fg?.id,
                },
                {
                  status: fgStatus,
                  timestamp,
                },
              ),
              await transactionalEntityManager.update(
                Friendship,
                {
                  id: fd?.id,
                },
                {
                  status: fdStatus,
                  timestamp,
                  message,
                },
              ),
            ]);
            await dataVersionService.updateFriendshipVersion(currentUserId, timestamp);
            if (fd?.status === FRIENDSHIP_REQUESTED) {
              await dataVersionService.updateFriendshipVersion(friendId, timestamp);

              // Session.getCurrentUserNickname(currentUserId, User).then(function(nickname) {
              //   return sendContactNotification(currentUserId, nickname, friendId, CONTACT_OPERATION_REQUEST, message, timestamp);
              // });
              // Cache.del("friendship_all_" + currentUserId);
              // Cache.del("friendship_all_" + friendId);
              // Utility.log('Invite result: %s %s', action, resultMessage);
              // console.log('fd.status === FRIENDSHIP_REQUESTED')
              ctx.success({
                action,
                message: resultMessage,
              });
            } else {
              removeBlackListPerson(currentUserId, friendId).then(function (result) {
                // Cache.del('friendship_all_' + currentUserId);
                // Cache.del('friendship_all_' + friendId);
                // Utility.log('Invite result: %s %s', action, resultMessage);
                ctx.success({
                  action,
                  message: resultMessage,
                });
              });
            }
          })
          .then(() => {
            ctx.status = 201;
            ctx.success({
              action,
              message: resultMessage,
            });
          });
      } else {
        if (friendId === currentUserId) {
          console.log('fd.status !== FRIENDSHIP_REQUESTED');
          const fr = new Friendship();
          fr.userId = currentUserId;
          fr.friendId = friendId;
          fr.message = '';
          fr.status = FRIENDSHIP_AGREED;
          fr.channleName = channleName;
          await friendshipRepository.save(fr);
          ctx.status = 200;
          ctx.success({
            action,
            message: resultMessage,
          });
        } else {
          await entityManager
            .transaction(async (transactionalEntityManager) => {
              const myFriendship = new Friendship();
              myFriendship.userId = currentUserId;
              myFriendship.friendId = friendId;
              myFriendship.message = '';
              myFriendship.status = FRIENDSHIP_REQUESTING;
              myFriendship.channleName = channleName;
              await transactionalEntityManager.save(myFriendship);

              const otherFriendship = new Friendship();
              otherFriendship.userId = friendId;
              otherFriendship.friendId = currentUserId;
              otherFriendship.message = message;
              otherFriendship.status = FRIENDSHIP_REQUESTED;
              otherFriendship.channleName = channleName;
              await transactionalEntityManager.save(otherFriendship);
            })
            .then(() => {
              ctx.status = 201;
              ctx.success({
                action: 'Sent',
                message: 'Request sent.',
              });
            });
        }
      }
    } else {
      await entityManager
        .transaction(async (transactionalEntityManager) => {
          const myFriendship = new Friendship();
          myFriendship.userId = Number(currentUserId);
          myFriendship.friendId = friendId;
          myFriendship.message = message;
          myFriendship.status = FRIENDSHIP_AGREED;
          myFriendship.channleName = channleName;
          await transactionalEntityManager.save(myFriendship);

          const otherFriendship = new Friendship();
          otherFriendship.userId = friendId;
          otherFriendship.friendId = Number(currentUserId);
          otherFriendship.message = message;
          otherFriendship.status = FRIENDSHIP_AGREED;
          otherFriendship.channleName = channleName;
          await transactionalEntityManager.save(otherFriendship);
        })
        .then(() => {
          ctx.status = 201;
          ctx.success({
            action: 'AddDirectly',
          });
        });
    }
  }

  @request('post', '/friendship/agree')
  @summary('同意添加好友')
  @description('example of api')
  @tag
  @body(friendshipSchema)
  public static async agreeInvite(ctx: Context) {
    let { friendId } = ctx.request.body;
    const { id: currentUserId } = ctx.state.user;

    await entityManager
      .transaction(async (transactionalEntityManager) => {
        const { affected: affectedCount } = await transactionalEntityManager.update(
          Friendship,
          {
            userId: currentUserId,
            friendId: friendId,
            status: In([FRIENDSHIP_REQUESTED, FRIENDSHIP_AGREED]),
          },
          {
            status: FRIENDSHIP_AGREED,
          },
        );
        if (affectedCount === 0) {
          ctx.fail({
            message: 'Unknown friend user or invalid status.',
          });
        }
        await transactionalEntityManager.update(
          Friendship,
          {
            userId: friendId,
            friendId: currentUserId,
          },
          {
            status: FRIENDSHIP_AGREED,
          },
        );
      })
      .then(() => {
        ctx.status = 200;
        ctx.success();
      });
  }

  @request('post', '/friendship/ignore')
  @summary('忽略添加好友')
  @description('example of api')
  @tag
  @body(friendshipSchema)
  public static async ignoreInvite(ctx: Context) {
    let { friendId } = ctx.request.body;
    const { id: currentUserId } = ctx.state.user;
    const timestamp = Date.now();

    const { affected: affectedCount } = await friendshipRepository.update(
      {
        userId: currentUserId,
        friendId: friendId,
        status: FRIENDSHIP_REQUESTED,
      },
      {
        status: FRIENDSHIP_IGNORED,
        timestamp,
      },
    );

    if (affectedCount === 0) {
      ctx.fail({
        message: 'Unknown friend user or invalid status.',
      });
    }

    await dataVersionService.updateFriendshipVersion(currentUserId, timestamp);
    ctx.success();
  }

  @request('post', '/friendship/delete')
  @summary('删除好友')
  @description('example of api')
  @tag
  @body(friendshipSchema)
  public static async deleteInvite(ctx: Context) {
    let { friendId } = ctx.request.body;
    const { id: currentUserId } = ctx.state.user;
    const timestamp = Date.now();

    const { affected: affectedCount } = await friendshipRepository.update(
      {
        userId: currentUserId,
        friendId: friendId,
        status: In([FRIENDSHIP_AGREED, FRIENDSHIP_PULLEDBLACK]),
      },
      {
        status: FRIENDSHIP_DELETED,
        displayName: '',
        message: '',
        timestamp,
      },
    );

    if (affectedCount === 0) {
      ctx.fail({
        message: 'Unknown friend user or invalid status.',
      });
    }

    await dataVersionService.updateFriendshipVersion(currentUserId, timestamp);
    await blacklistRepository.upsert([{
      userId: currentUserId,
      friendId: friendId,
      status: true,
      timestamp,
    }], ['userId', 'friendId']);

    await dataVersionService.updateBlacklistVersion(currentUserId, timestamp)

    await friendshipRepository.update(
      {
        userId: currentUserId,
        friendId: friendId,
        status: FRIENDSHIP_AGREED
      },
      {
        status: FRIENDSHIP_DELETED,
        displayName: '',
        message: '',
        timestamp: timestamp
      },
    );

    ctx.success();
  }

  @request('get', '/friendship/all')
  @summary('列表')
  @description('example of api')
  @tag
  @query(paginationSchema)
  public static async listFriendships(ctx: Context) {
    let { page, size } = ctx.query;
    const { id: currentUserId } = ctx.state.user;
    
    const _page = page ? Number(page) : 1;
    const _size = size ? Number(size) : 20;
    const skip: number = (_page - 1) * _size;

    const [friendships, count] = await friendshipRepository.findAndCount({
      where: {
        userId: currentUserId,
        status: FRIENDSHIP_AGREED,
      },
      take: _size,
      skip,
      relations: {
        user: true,
      },
    });

    ctx.status = 200;
    ctx.success({
      friendships,
      count
    });
  }
}
