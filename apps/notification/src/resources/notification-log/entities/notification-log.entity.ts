import {
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  Table,
  UpdatedAt
} from 'sequelize-typescript';
import { NotificationAttempt } from './notification-attempt.entity';

@Table
export class NotificationLog extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column
  job: string;

  @Column
  state: string;

  @Column
  attempts: number;

  @Column({ type: DataType.JSON })
  data: string;

  @Column
  addedAt: Date;

  @Column({ allowNull: true })
  finishedOn: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => NotificationAttempt)
  attemptHistory: NotificationAttempt[];
}
