// src/entity/user.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50
  })
  name: string;

  @Column({ select: false })
  password: string;

  @Column()
  email: string;
}
