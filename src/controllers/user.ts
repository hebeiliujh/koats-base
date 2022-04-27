// src/controllers/user.ts
import { Context } from 'koa';

import { AppDataSource } from '../app-data-source';
import { NotFoundException, ForbiddenException } from '../exceptions';
import { User } from '../entity/user';

const userRepository = AppDataSource.getRepository(User)

export default class UserController {
  public static async listUsers(ctx: Context) {
    const users = await userRepository.find();

    ctx.status = 200;
    ctx.body = users;
  }

  public static async showUserDetail(ctx: Context) {
    const user = await userRepository.findOneBy({id: +ctx.params.id});

    if (user) {
      ctx.status = 200;
      ctx.body = user;
    } else {
      throw new NotFoundException();
    }
  }

  public static async updateUser(ctx: Context) {
    const userId = +ctx.params.id;

    if (userId !== +ctx.state.user.id) {
      throw new ForbiddenException();
    }

    await userRepository.update(+ctx.params.id, ctx.request.body);
    const updatedUser = await userRepository.findOneBy({id: +ctx.params.id});

    if (updatedUser) {
      ctx.status = 200;
      ctx.body = updatedUser;
    } else {
      ctx.status = 404;
    }
  }

  public static async deleteUser(ctx: Context) {
    const userId = +ctx.params.id;

    if (userId !== +ctx.state.user.id) {
      throw new ForbiddenException();
    }

    await userRepository.delete(+ctx.params.id);

    ctx.status = 204;
  }
}
