import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript';
import { FilterOps } from '../../../common/types/filter.type';
import { SubscriptionQueryDto } from '../dto/subscription-query.dto';
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
  operator: FilterOps;

  @Column({ type: DataType.JSON })
  query: SubscriptionQueryDto;

  @BelongsTo(() => Subscription)
  subscription: Subscription;
}
