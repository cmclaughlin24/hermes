import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { FilterOps } from '../../../../common/types/filter.type';
import { Subscription } from './subscription.entity';

@Entity()
export class SubscriptionFilter {
  @PrimaryColumn('uuid')
  subscriptionId: string;

  @PrimaryColumn()
  field: string;

  @Column({
    type: 'enum',
    enumName: 'filter-operator',
    enum: FilterOps,
  })
  operator: FilterOps;

  @Column()
  dataType: string;

  @Column({ type: 'simple-json' })
  value: any;

  @ManyToOne(() => Subscription, (sub) => sub.filters, {
    onDelete: 'CASCADE',
  })
  subscription: Subscription;
}
