import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table
} from 'sequelize-typescript';
import { FilterJoinOps } from '../../../common/types/filter.types';
import { DistributionEvent } from '../../distribution-event/entities/distribution-event.entity';
import { SubscriptionFilter } from './subscription-filter.entity';

@Table
export class Subscription extends Model {
  @Column({
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => DistributionEvent)
  distributionEventId: string;

  @Column
  url: string;

  @Column
  filterJoin: FilterJoinOps;

  @BelongsTo(() => DistributionEvent)
  distributionEvent: DistributionEvent;

  @HasMany(() => SubscriptionFilter, { onDelete: 'CASCADE' })
  filters: SubscriptionFilter[];
}
