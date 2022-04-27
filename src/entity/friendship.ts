import { Length } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

const FRIEND_REQUEST_MESSAGE_MIN_LENGTH = 0;
const FRIEND_REQUEST_MESSAGE_MAX_LENGTH = 64;

@Entity()
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: 0,
    comment: 'UserId'
  })
  userId: number;

  @Column({
    default: 0,
    comment: 'FriendId'
  })
  friendId: number;
  
  @Column({
    comment: 'Display friend name',
    nullable: true,
    default: ''
  })
  displayName: string;

  @Column({
    default: '',
    comment: 'message'
  })
  @Length(FRIEND_REQUEST_MESSAGE_MIN_LENGTH, FRIEND_REQUEST_MESSAGE_MAX_LENGTH)
  message: string;

  @Column({
    default: 10,
    comment: '10-请求, 11-被请求, 20-同意, 21-忽略, 30-被删除, 31-被拉黑'
  })
  status: number;

  @Column({
    default: '',
    comment: 'Display channle name'
  })
  channleName: string;

  @CreateDateColumn()
  createdDate: Date;
}