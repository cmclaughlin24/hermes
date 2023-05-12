import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript';
import { NotificationLog } from './notification-log.entity';

@Table({ updatedAt: false, createdAt: false })
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
  processedAt: Date;

  @Column({ type: DataType.JSON, allowNull: true })
  result: any;

  @Column({ type: DataType.JSON, allowNull: true })
  error: Error;

  @BelongsTo(() => NotificationLog)
  log: NotificationLog;
}
