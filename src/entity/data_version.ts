import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class DataVersion {

  @PrimaryColumn()
  userId: number;

  @Column({
    type: 'bigint',
    default: 0,
    comment: '用户信息时间戳（版本号）'
  })
  userVersion: number;
  
  @Column({
    type: 'bigint',
    default: 0,
    comment: '黑名单时间戳（版本号）'
  })
  blacklistVersion: number;

  @Column({
    type: 'bigint',
    default: 0,
    comment: '好友关系时间戳（版本号）'
  })
  friendshipVersion: number;

  @Column({
    type: 'bigint',
    default: 0,
    comment: '群组信息时间戳（版本号）'
  })
  groupVersion: number;

  @Column({
    type: 'bigint',
    default: 0,
    comment: '群组关系时间戳（版本号）'
  })
  groupMemberVersion: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}