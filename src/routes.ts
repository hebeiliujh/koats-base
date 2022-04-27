// src/routes.ts
import Router from '@koa/router';

import AuthController from './controllers/auth';
import UserController from './controllers/user';
import FriendController from './controllers/friendship';
import VideoController from './controllers/video';

const unprotectedRouter = new Router();

// auth 相关的路由
unprotectedRouter.post('/auth/login', AuthController.login);
unprotectedRouter.post('/auth/register', AuthController.register);

const protectedRouter = new Router();

// auth 相关的路由
protectedRouter.get('/auth/profile', AuthController.profile);
// users 相关的路由
protectedRouter.get('/users', UserController.listUsers);
protectedRouter.get('/users/:id', UserController.showUserDetail);
protectedRouter.put('/users/:id', UserController.updateUser);
protectedRouter.delete('/users/:id', UserController.deleteUser);
// friendship 相关的路由
protectedRouter.post('/friendship/invite', FriendController.inviteFriend);
// video 相关的路由
protectedRouter.get('/video/genAccessTokenByChatRoomID/:chatroomId', VideoController.genAccessTokenByChatRoomID);
protectedRouter.get('/video/getVideoChatRoomId/:dialogistId', VideoController.getVideoChatRoomId);
protectedRouter.get('/video/get256AESSecretAndSalt/:channelId', VideoController.get256AESSecretAndSalt);

export { protectedRouter, unprotectedRouter };
