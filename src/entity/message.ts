import { Length } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';

const FRIEND_SEND_MESSAGE_MIN_LENGTH = 0;
const FRIEND_SEND_MESSAGE_MAX_LENGTH = 2048;

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: 0,
    comment: 'UserId'
  })
  userId: number;

  @Column({
    default: '',
    comment: 'message'
  })
  @Length(FRIEND_SEND_MESSAGE_MIN_LENGTH, FRIEND_SEND_MESSAGE_MAX_LENGTH)
  message: string;

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

  @ManyToOne(() => User, (user) => user.message)
  @JoinTable()
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}