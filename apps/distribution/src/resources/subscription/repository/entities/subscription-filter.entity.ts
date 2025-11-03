import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { FilterOps } from '../../../../common/types/filter.type';
import { SubscriptionEntity } from './subscription.entity';

@Entity()
export class SubscriptionFilterEntity {
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

  @ManyToOne(() => SubscriptionEntity, (sub) => sub.filters, {
    onDelete: 'CASCADE',
  })
  subscription: SubscriptionEntity;
}
