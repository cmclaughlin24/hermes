import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { FilterJoinOps } from '../../../../common/types/filter.type';
import {
  SubscriptionData,
  SubscriptionType,
} from '../../../../common/types/subscription-type.type';
import { DistributionEvent } from '../../../distribution-event/repository/entities/distribution-event.entity';
import { SubscriptionFilter } from './subscription-filter.entity';

@Entity()
@Unique(['subscriberId', 'distributionEventType'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subscriberId: string;

  @Column()
  distributionEventType: string;

  @Column({
    type: 'enum',
    enumName: 'subscription-type',
    enum: SubscriptionType,
  })
  subscriptionType: SubscriptionType;

  @Column({ type: 'simple-json' })
  data: SubscriptionData;

  @Column({
    type: 'enum',
    enumName: 'filter-join-operators',
    enum: FilterJoinOps,
  })
  filterJoin: FilterJoinOps;

  @ManyToOne(() => DistributionEvent, (event) => event.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'distributionEventType' })
  distributionEvent: DistributionEvent;

  @OneToMany(() => SubscriptionFilter, (filter) => filter.subscription, {
    cascade: true,
  })
  filters: SubscriptionFilter[];
}
