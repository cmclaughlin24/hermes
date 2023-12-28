import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { FilterOps } from '../../../common/types/filter.type';
import { Subscription } from './subscription.entity';

@Table({ tableName: 'subscription_filter' })
export class SubscriptionFilter extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
  })
  @ForeignKey(() => Subscription)
  subscriptionId: string;

  @Column({
    primaryKey: true,
  })
  field: string;

  @Column
  operator: FilterOps;

  @Column
  dataType: string;

  @Column({ type: DataType.JSON })
  value: any;

  @BelongsTo(() => Subscription)
  subscription: Subscription;
}
