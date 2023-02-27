import { HasMany, Model, Table } from 'sequelize-typescript';
import { SubscriptionFilter } from './subscription-filter.entity';

@Table
export class Subscription extends Model {
  @HasMany(() => SubscriptionFilter)
  filters: SubscriptionFilter[];
}
