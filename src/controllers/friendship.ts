// src/controllers/friendship.ts
import { Context } from 'koa';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';

import { AppDataSource } from '../app-data-source';
import { NotFoundException } from '../exceptions';
import { User } from '../entity/user';
import { Friendship } from '../entity/friendship';
// import { filterXss } from '../utils/utils';

// const FRIENDSHIP_REQUESTING = 10;
// const FRIENDSHIP_REQUESTED = 11;
const FRIENDSHIP_AGREED = 20;
// const FRIENDSHIP_IGNORED = 21;
// const FRIENDSHIP_DELETED = 30;
// const FRIENDSHIP_PULLEDBLACK = 31;
// const FRIEND_REQUEST_MESSAGE_MIN_LENGTH = 0;
// const FRIEND_REQUEST_MESSAGE_MAX_LENGTH = 64;
// const FRIEND_DISPLAY_NAME_MIN_LENGTH = 1;
// const FRIEND_DISPLAY_NAME_MAX_LENGTH = 32;
// const CONTACT_OPERATION_ACCEPT_RESPONSE = 'AcceptResponse';
// const CONTACT_OPERATION_REQUEST = 'Request';

const userRepository = AppDataSource.getRepository(User);
const entityManager = AppDataSource.manager;

export default class FriendController {
  public static async inviteFriend(ctx: Context) {
    console.log('ctx.request.body', ctx.request.body);

    const { friendId, message } = ctx.request.body;
    const errors = await validate(Friendship);
    if (errors.length) {
      throw new Error(`Validation failed!`);
    }

    const { id: currentUserId } = ctx.state.user;

    const friend = userRepository.findOneBy({ id: friendId });

    if (!friend) {
      throw new NotFoundException('User not found');
    }

    const channleName = uuidv4();

    await entityManager.transaction(async (transactionalEntityManager) => {
      const myFriendship = new Friendship();
      myFriendship.userId = Number(currentUserId);
      myFriendship.friendId = friendId;
      myFriendship.message = message;
      myFriendship.status = FRIENDSHIP_AGREED;
      myFriendship.channleName = channleName;

      const otherFriendship = new Friendship();
      otherFriendship.userId = friendId;
      otherFriendship.friendId = Number(currentUserId);
      otherFriendship.message = message;
      otherFriendship.status = FRIENDSHIP_AGREED;
      otherFriendship.channleName = channleName;

      await transactionalEntityManager.save(myFriendship);
      await transactionalEntityManager.save(otherFriendship);
    }).then(() => {
      ctx.status = 201;
      ctx.body = {
        action: 'AddDirectly',
      };
    })
  }
}
