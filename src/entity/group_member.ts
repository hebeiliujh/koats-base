import { MaxLength } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Group } from './group';
import { User } from './user';

@Entity()
export class GroupMember {

  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  @Index()
  groupId: number;

  @Column()
  @Index()
  memberId: number;

  @Column({
    default: ''
  })
  @MaxLength(32)
  displayName: string;

  @Column({
    type: 'tinyint',
    comment: '0: 创建者, 1: 普通成员'
  })
  role: number;

  @Column({
    type: 'boolean',
    default: false
  })
  @Index()
  isDeleted: boolean;

  @Column({
    default: ''
  })
  @MaxLength(32)
  groupNickname: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  @MaxLength(800)  
  memberDesc: string;

  @Column({
    type: 'bigint',
    default: 0,
    comment: '时间戳（版本号）'
  })
  timestamp: number;

  @ManyToOne(() => User, (user) => user.groupMember)
  user: User

  @ManyToOne(() => Group, (group) => group.groupMember)
  group: Group

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}