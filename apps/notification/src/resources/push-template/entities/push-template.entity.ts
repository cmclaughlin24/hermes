import { TextDirection } from '@hermes/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PushAction } from './push-action.entity';

@Entity()
export class PushTemplate {
  @PrimaryColumn()
  name: string;

  @Column({ nullable: true })
  badge: string;

  @Column({ nullable: true })
  body: string;

  @Column({ type: 'simple-json', nullable: true })
  data: string;

  @Column({
    enumName: 'TextDirection',
    enum: [TextDirection.AUTO, TextDirection.LTR, TextDirection.RTL],
    nullable: true,
  })
  dir: TextDirection;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  lang: string;

  @Column({ nullable: true })
  renotify: boolean;

  @Column({ nullable: true })
  requireInteraction: boolean;

  @Column({ nullable: true })
  silent: boolean;

  @Column({ nullable: true })
  tag: string;

  @Column({ nullable: true })
  timestamp: string;

  @Column()
  title: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  vibrate: number[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PushAction, (action) => action.template, {
    cascade: true,
  })
  actions: PushAction[];
}
