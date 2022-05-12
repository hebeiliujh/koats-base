// src/entity/user.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index, JoinTable, JoinColumn } from 'typeorm';
import { Blacklist } from './blacklist';
import { Friendship } from './friendship';
import { GroupMember } from './group_member';

export enum GENDER {
  MALE = 'male',
  FEMALE = 'female',
  SECRET = 'secret'
}
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
    default: null,
    comment: 'first name'
  })
  firstName: string

  @Column({
    nullable: true,
    default: null,
    comment: 'last name'
  })
  lastName: string

  @Column({
    length: 50,
    comment: 'user name'
  })
  username: string;

  @Column({
    select: false,
    comment: 'user password'
  })
  password: string;

  @Column({
    comment: 'user email'
  })
  @Index()
  email: string;

  @Column({
    type: 'enum',
    enum: GENDER,
    default: GENDER.SECRET,
    comment: 'user gender',
  })
  gender: GENDER;

  @Column({
    default: '',
    comment: 'user avater'
  })
  avater: string;

  @Column({
    nullable: true,
    default: null,
    length: 32,
    comment: 'user slogan'
  })
  slogan: string;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
    comment: 'user description'
  })
  description: string;
  
  @Column({
    default: 1,
    type: 'tinyint',
    comment: 'is need friendship verify, 1: yes, 0: no',
  })
  friVerify: number;

  @Column({
    default: 1,
    type: 'tinyint',
    comment: 'is need groupship verify, 1: yes, 0: no',
  })
  groupVerify: number;

  @Column({
    type: 'bigint',
    default: 0,
    comment: '时间戳（版本号）'
  })
  timestamp: number;

  @OneToMany(() => Friendship, (friendship) => friendship.user)
  friendship: Friendship[]

  @OneToMany(() => Blacklist, (blacklist) => blacklist.user)
  blacklist: Blacklist[]

  @OneToMany(() => GroupMember, (groupMember) => groupMember.user)
  groupMember: GroupMember[]

  @Column({
    nullable: true,
    default: null,
    comment: 'user last login date',
  })
  lastLoginDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
