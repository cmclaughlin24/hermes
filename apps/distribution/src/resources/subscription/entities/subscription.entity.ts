import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { FilterJoinOps } from '../../../common/types/filter.type';
import {
  SubscriptionData,
  SubscriptionType,
} from '../../../common/types/subscription-type.type';
import { DistributionEvent } from '../../distribution-event/entities/distribution-event.entity';
import { SubscriptionFilter } from './subscription-filter.entity';

@Table({
  indexes: [
    {
      unique: true,
      fields: ['externalId', 'distributionEventId'],
    },
  ],
})
export class Subscription extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column
  externalId: string;

  @ForeignKey(() => DistributionEvent)
  distributionEventId: string;

  @Column({
    type: DataType.ENUM(
      SubscriptionType.USER,
      SubscriptionType.PUSH,
      SubscriptionType.REQUEST,
    ),
  })
  subscriptionType: SubscriptionType;

  @Column({ type: DataType.JSON })
  data: SubscriptionData;

  @Column
  filterJoin: FilterJoinOps;

  @BelongsTo(() => DistributionEvent)
  distributionEvent: DistributionEvent;

  @HasMany(() => SubscriptionFilter, { onDelete: 'CASCADE' })
  filters: SubscriptionFilter[];
}
