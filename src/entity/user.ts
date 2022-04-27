// src/entity/user.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({
    length: 50
  })
  username: string;

  @Column({ select: false })
  password: string;

  @Column()
  email: string;
}
