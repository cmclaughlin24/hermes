import {
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { MessageState } from '../../../common/types/message-state.type';
import { DistributionAttempt } from './distribution-attempt.entity';

@Table
export class DistributionLog extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column
  eventType: string;

  @Column
  state: MessageState;

  @Column
  attempts: number;

  @Column({ type: DataType.JSON, allowNull: true })
  metadata: string;

  @Column({ type: DataType.JSON, allowNull: true })
  data: string;

  @Column
  addedAt: Date;

  @Column({ allowNull: true })
  finishedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => DistributionAttempt, { onDelete: 'CASCADE' })
  attemptHistory: DistributionAttempt[];
}
