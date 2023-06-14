import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { FilterJoinOps } from '../../../common/types/filter.type';
import { DistributionEvent } from '../../distribution-event/entities/distribution-event.entity';
import { SubscriptionFilter } from './subscription-filter.entity';

@Table
export class Subscription extends Model {
  @Column({
    primaryKey: true,
  })
  id: string;

  @PrimaryKey
  @ForeignKey(() => DistributionEvent)
  distributionEventId: string;

  @Column
  subscriptionType: string;

  @Column({ type: DataType.JSON })
  data: any;

  @Column
  filterJoin: FilterJoinOps;

  @BelongsTo(() => DistributionEvent)
  distributionEvent: DistributionEvent;

  @HasMany(() => SubscriptionFilter, { onDelete: 'CASCADE' })
  filters: SubscriptionFilter[];
}
