// src/controllers/friendship.ts
import { Context } from 'koa';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';
import dayjs from 'dayjs';

import { AppDataSource } from '../app-data-source';
import { NotFoundException } from '../exceptions';
import { User } from '../entity/user';
import { Friendship } from '../entity/friendship';
import { body, description, request, summary, tags } from 'koa-swagger-decorator';
import FriendshipService from '../services/friendship';
import { In } from 'typeorm';
// import { filterXss } from '../utils/utils';

const tag = tags(['Friendship']);
const friendshipSchema = {
  friendId: { type: 'number', required: true },
  message: { type: 'string', required: false },
};

const FRIENDSHIP_REQUESTING = 10;
const FRIENDSHIP_REQUESTED = 11;
const FRIENDSHIP_AGREED = 20;
const FRIENDSHIP_IGNORED = 21;
const FRIENDSHIP_DELETED = 30;
// const FRIENDSHIP_PULLEDBLACK = 31;
// const FRIEND_REQUEST_MESSAGE_MIN_LENGTH = 0;
// const FRIEND_REQUEST_MESSAGE_MAX_LENGTH = 64;
// const FRIEND_DISPLAY_NAME_MIN_LENGTH = 1;
// const FRIEND_DISPLAY_NAME_MAX_LENGTH = 32;
// const CONTACT_OPERATION_ACCEPT_RESPONSE = 'AcceptResponse';
// const CONTACT_OPERATION_REQUEST = 'Request';

const userRepository = AppDataSource.getRepository(User);
// const friendshipRepository = AppDataSource.getRepository(Friendship);
const friendshipService = new FriendshipService();
const entityManager = AppDataSource.manager;

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

    const friend = await userRepository.findOneBy({ id: friendId });

    if (!friend) {
      throw new NotFoundException('User not found');
    }

    const channleName = uuidv4();

    if (friend.friVerify === 1) {
      let action: string,
        fd: Friendship | null,
        fdStatus: number,
        fg: Friendship | null,
        fgStatus: number,
        resultMessage: string,
        unit;
      [fg, fd] = await Promise.all([
        friendshipService.getInfo(currentUserId, friendId),
        friendshipService.getInfo(friendId, currentUserId),
      ]);
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
            await transactionalEntityManager.update(
              Friendship,
              {
                id: fg?.id,
              },
              {
                status: fgStatus,
              },
            );
            await transactionalEntityManager.update(
              Friendship,
              {
                id: fd?.id,
              },
              {
                status: fdStatus,
                message,
              },
            );
            // if (fd?.status === FRIENDSHIP_REQUESTED) {
            // }
          })
          .then(() => {
            ctx.status = 201;
            ctx.success({
              action,
              message: resultMessage,
            });
          });
      } else {
        // if (friendId === currentUserId) {
        //   console.log('fd.status !== FRIENDSHIP_REQUESTED')
        // }

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
}
