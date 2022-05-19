import { Length } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';

const FRIEND_REQUEST_MESSAGE_MIN_LENGTH = 0;
const FRIEND_REQUEST_MESSAGE_MAX_LENGTH = 64;

@Entity()
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: 0,
    comment: 'UserId',
    unique: true
  })
  userId: number;

  @Column({
    default: 0,
    comment: 'FriendId',
    unique: true
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
    type: 'tinyint',
    comment: '10-请求, 11-被请求, 20-同意, 21-忽略, 30-被删除, 31-被拉黑'
  })
  status: number;

  @Column({
    default: '',
    comment: 'Display channel name'
  })
  channelName: string;

  @Column({
    default: '',
    comment: 'Display conversation Id'
  })
  conversationId: string;

  @Column({
    type: 'bigint',
    default: 0,
    comment: '时间戳（版本号）'
  })
  timestamp: number;

  @ManyToOne(() => User, (user) => user.friendship)
  @JoinTable()
  @JoinColumn({ name: 'friendId' })
  user: User

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}