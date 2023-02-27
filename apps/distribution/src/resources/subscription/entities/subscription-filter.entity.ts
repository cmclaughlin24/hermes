import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Subscription } from './subscription.entity';

@Table
export class SubscriptionFilter extends Model {
  @Column({
    primaryKey: true,
  })
  subscriptionId: string;

  @Column({
    primaryKey: true,
  })
  @ForeignKey(() => Subscription)
  field: string;

  @Column
  operator: string;

  @BelongsTo(() => Subscription, 'subscriptionId')
  subscription: Subscription;
}
