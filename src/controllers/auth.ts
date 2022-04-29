// src/controllers/auth.ts
import { Context } from 'koa';
import * as argon2 from 'argon2';
import { AppDataSource } from '../app-data-source';
import jwt from 'jsonwebtoken';
import { body, description, request, summary, tags } from 'koa-swagger-decorator';

import { UnauthorizedException } from '../exceptions';
import { JWT_SECRET } from '../constants';
import { User } from '../entity/user';

const tag = tags(['Auth']);
const userSchema = {
  email: { type: 'string', required: true },
  password: { type: 'string', required: true },
  username: { type: 'string', required: false },
};

const userRepository = AppDataSource.getRepository(User);
const tokenExpireSeconds = 24 * 60 * 60; // 24 hours
export default class AuthController {
  @request('post', '/auth/login')
  @summary('用户登录， 账号： user1@qq.com, 密码： User1@123')
  @tag
  @body(userSchema)
  public static async login(ctx: Context) {
    const { email, password } = ctx.request.body;
    const user = await userRepository.findOne({
      where: { email },
      select: ['id', 'password', 'firstName', 'lastName', 'username', 'gender'],
    });

    if (!user) {
      throw new UnauthorizedException('用户名不存在');
    } else if (await argon2.verify(user.password, password)) {
      ctx.status = 200;
      ctx.success({
        access_token: jwt.sign(
          {
            id: user.id,
            email: user.email,
          },
          JWT_SECRET,
          {
            expiresIn: tokenExpireSeconds,
          },
        ),
        tokenExpireSeconds,
      });
    } else {
      throw new UnauthorizedException('密码错误');
    }
  }

  @request('post', '/auth/register')
  @summary('注册一个用户')
  @description('example of api')
  @tag
  @body(userSchema)
  public static async register(ctx: Context) {
    const { username, email, password } = ctx.request.body;
    const checkUser = await userRepository.findOneBy({ email });
    if (checkUser) {
      return (ctx.body = {
        message: '该邮箱已注册',
      });
    }
    const newUser = new User();
    newUser.username = username;
    newUser.email = email;
    newUser.password = await argon2.hash(password);

    // 保存到数据库
    const user = await userRepository.save(newUser);

    ctx.status = 201;
    ctx.success(user);
  }

  @request('get', '/auth/profile')
  @summary('获取用户信息')
  @description('get user profile')
  @tag
  public static async profile(ctx: Context) {
    const { id } = ctx.state.user;
    const user = await userRepository.findOneBy({ id });
    // 中间件将验证后的用户数据直接返回给浏览器
    // ctx.body = ctx.state.user;
    ctx.status = 200;
    ctx.success(user);
  }
}
