import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Group } from './group';

@Entity()
export class GroupBulletin {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @Column({
    type: 'text',
    nullable: true
  })
  content: string;

  @ManyToOne(() => Group, (group) => group.groupFav)
  group: Group

  @Column({
    type: 'bigint',
    default: 0,
    comment: '时间戳（版本号）'
  })
  timestamp: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}