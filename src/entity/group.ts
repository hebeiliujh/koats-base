import { MaxLength } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { GroupFav } from './group_fav';
import { GroupMember } from './group_member';
import { User } from './user';

@Entity()
export class Group {

  @PrimaryGeneratedColumn()
  @Index()
  id: number;

  @Column({
    comment: '最小 2 个字'
  })
  @MaxLength(32)
  name: string;
  
  @Column({
    default: ''
  })
  portraitUri: string;

  @Column({
    default: 0
  })
  memberCount: number;

  @Column({
    default: 500
  })
  maxMemberCount: number;

  @Column()
  creatorId: number;

  @Column({
    type: 'text',
    nullable: true
  })
  bulletin: number;

  @Column({
    type: 'tinyint',
    default: 1
  })
  certiStatus: number;

  @Column({
    type: 'tinyint',
    default: 0
  })
  isMute: number;

  @Column({
    type: 'bigint',
    default: 0,
    comment: '设置清除时间'
  })
  clearStatus: number;

  @Column({
    type: 'tinyint',
    default: 0
  })
  clearTimeAt: Date;

  @Column({
    type: 'bigint',
    default: 0,
    comment: '时间戳（版本号）'
  })
  @Index()
  timestamp: number;

  @OneToMany(() => GroupFav, (groupFav) => groupFav.group)
  groupFav: GroupFav[]

  @OneToMany(() => GroupMember, (groupMember) => groupMember.group)
  groupMember: GroupMember[]

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}