// src/entity/user.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
    unique: true,
    comment: 'user email'
  })
  email: string;

  @Column({
    type: 'enum',
    enum: GENDER,
    default: GENDER.SECRET,
    comment: 'user gender',
  })
  gender: GENDER;

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
