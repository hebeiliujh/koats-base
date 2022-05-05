// src/entity/user.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Blacklist } from './blacklist';
import { Friendship } from './friendship';
import { GroupMember } from './group_member';

export enum GENDER {
  MALE = 'male',
  FEMALE = 'female',
  SECRET = 'secret'
}
@Entity()
export class LoginLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number

  @Column()
  ipAddress: number

  @Column({
    length: 64,
  })
  os: string;

  @Column({
    length: 64,
  })
  osVersion: string;

  @Column({
    length: 64,
  })
  carrier: string;

  @Column({
    length: 64,
  })
  device: string;

  @Column({
    length: 64,
  })
  manufacturer: string;

  @Column({
    length: 256,
  })
  userAgent: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
