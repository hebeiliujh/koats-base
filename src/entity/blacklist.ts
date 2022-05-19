import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Blacklist {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true
  })
  // @Index()
  userId: number;

  @Column({
    unique: true
  })
  // @Index()
  friendId: number;

  @Column({
    type: 'boolean',
    comment: 'true: 拉黑'
  })
  status: boolean;

  @Column({
    type: 'bigint',
    default: 0,
    comment: '时间戳（版本号）'
  })
  timestamp: number;

  @ManyToOne(() => User, (user) => user.blacklist)
  user: User

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}