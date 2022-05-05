import { MaxLength } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Group } from './group';

@Entity()
export class GroupFav {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true
  })
  userId: number;
  
  @Column({
    unique: true
  })
  groupId: number;

  @ManyToOne(() => Group, (group) => group.groupFav)
  group: Group

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}