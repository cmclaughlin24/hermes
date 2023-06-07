import { TextDirection } from '@hermes/common';
import {
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { PushAction } from './push-action.entity';

@Table
export class PushTemplate extends Model {
  @Column({ primaryKey: true })
  name: string;

  @Column({ allowNull: true })
  badge: string;

  @Column({ allowNull: true })
  body: string;

  @Column({ type: DataType.JSON })
  data: string;

  @Column({
    type: DataType.ENUM(
      TextDirection.AUTO,
      TextDirection.LTR,
      TextDirection.RTL,
    ),
    allowNull: true,
  })
  dir: TextDirection;

  @Column({ allowNull: true })
  icon: string;

  @Column({ allowNull: true })
  image: string;

  @Column({ allowNull: true })
  lang: string;

  @Column({ allowNull: true })
  renotify: boolean;

  @Column({ allowNull: true })
  requireInteraction: boolean;

  @Column({ allowNull: true })
  silent: boolean;

  @Column({ allowNull: true })
  tag: string;

  @Column({ allowNull: true })
  timestamp: string;

  @Column
  title: string;

  @Column({
    allowNull: true,
    type: DataType.ARRAY(DataType.INTEGER),
  })
  vibrate: number[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => PushAction, { onDelete: 'CASCADE' })
  actions: PushAction[];
}
