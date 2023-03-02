import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { SubscriptionFilterOps } from '../../../common/constants/subscription-filter.constants';
import { Subscription } from './subscription.entity';

@Table
export class SubscriptionFilter extends Model {
  @Column({
    primaryKey: true,
  })
  @ForeignKey(() => Subscription)
  subscriptionId: string;

  @Column({
    primaryKey: true,
  })
  field: string;

  @Column
  operator: SubscriptionFilterOps;

  @Column
  query: string;

  @BelongsTo(() => Subscription)
  subscription: Subscription;
}
