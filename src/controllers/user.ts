// src/controllers/user.ts
import { Context } from 'koa';

import { AppDataSource } from '../app-data-source';
import { NotFoundException, ForbiddenException } from '../exceptions';
import { User } from '../entity/user';
import { body, description, params, path, request, summary, tags } from 'koa-swagger-decorator';

const tag = tags(['User'])
const userRepository = AppDataSource.getRepository(User)
const userSchema = {
  id: { type: 'number', required: true },
};
export default class UserController {
  @request('get', '/users')
  @summary('用户列表')
  @description('example of api')
  @tag
  public static async listUsers(ctx: Context) {
    const users = await userRepository.find();

    ctx.status = 200;
    ctx.success(users);
  }

  @request('get', '/users/:id')
  @summary('通过用户id，获取用户详情')
  @description('example of api')
  @tag
  @path({
    id: { type: 'number', required: true, default: 1, description: 'id' },
  })
  public static async showUserDetail(ctx: Context) {
    const user = await userRepository.findOneBy({id: +ctx.params.id});

    if (user) {
      ctx.status = 200;
      ctx.success(user);
    } else {
      throw new NotFoundException();
    }
  }

  @request('put', '/users/:id')
  @summary('更新用户信息')
  @description('example of api')
  @tag
  @path({
    id: { type: 'number', required: true, default: 1, description: 'id' },
  })
  public static async updateUser(ctx: Context) {
    const userId = +ctx.params.id;

    if (userId !== +ctx.state.user.id) {
      throw new ForbiddenException();
    }

    await userRepository.update(+ctx.params.id, ctx.request.body);
    const updatedUser = await userRepository.findOneBy({id: +ctx.params.id});

    if (updatedUser) {
      ctx.status = 200;
      ctx.success(updatedUser);
    } else {
      ctx.status = 404;
    }
  }

  @request('delete', '/users/:id')
  @summary('删除用户')
  @description('example of api')
  @tag
  @path({
    id: { type: 'number', required: true, default: 1, description: 'id' },
  })
  public static async deleteUser(ctx: Context) {
    const userId = +ctx.params.id;

    if (userId !== +ctx.state.user.id) {
      throw new ForbiddenException();
    }

    await userRepository.delete(+ctx.params.id);

    ctx.status = 204;
    ctx.success();
  }
}
