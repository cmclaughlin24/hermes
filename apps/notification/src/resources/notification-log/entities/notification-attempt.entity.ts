import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { NotificationLog } from './notification-log.entity';

@Table({ updatedAt: false })
export class NotificationAttempt extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
  })
  @ForeignKey(() => NotificationLog)
  logId: string;

  @Column({ primaryKey: true })
  attempt: number;

  @Column
  processedOn: Date;

  @Column({ type: DataType.JSON, allowNull: true })
  result: any;

  @Column({ type: DataType.JSON, allowNull: true })
  error: Error;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => NotificationLog)
  log: NotificationLog;
}
