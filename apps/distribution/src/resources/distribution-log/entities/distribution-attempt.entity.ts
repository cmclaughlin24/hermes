import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { DistributionLog } from './distribution-log.entity';

@Table({
  tableName: 'distribution_attempt',
  updatedAt: false,
  createdAt: false,
})
export class DistributionAttempt extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
  })
  @ForeignKey(() => DistributionLog)
  logId: string;

  @Column({ primaryKey: true })
  attempt: number;

  @Column
  processedAt: Date;

  @Column({ type: DataType.JSON, allowNull: true })
  result: any;

  @Column({ type: DataType.JSON, allowNull: true })
  error: any;

  @BelongsTo(() => DistributionLog)
  log: DistributionLog;
}
