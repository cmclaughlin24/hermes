import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { SubscriptionFilter } from './subscription-filter.entity';

@Table
export class Subscription extends Model {
  @Column({
    primaryKey: true,
  })
  id: string;

  @Column
  url: string;

  @HasMany(() => SubscriptionFilter)
  filters: SubscriptionFilter[];
}
