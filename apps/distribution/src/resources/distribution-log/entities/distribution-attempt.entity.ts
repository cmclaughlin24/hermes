import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { DistributionLog } from './distribution-log.entity';

@Table({ updatedAt: false })
export class DistributionAttempt extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
  })
  @ForeignKey(() => DistributionLog)
  logId: string;

  @Column({ primaryKey: true })
  attempt: number;

  @Column({ type: DataType.JSON, allowNull: true })
  result: any;

  @Column({ type: DataType.JSON, allowNull: true })
  error: any;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => DistributionLog)
  log: DistributionLog;
}
