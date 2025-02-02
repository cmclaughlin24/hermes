import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { DistributionRule } from '../../../distribution-rule/repository/entities/distribution-rule.entity';
import { Subscription } from '../../../subscription/repository/entities/subscription.entity';

@Entity()
export class DistributionEvent {
  @PrimaryColumn()
  eventType: string;

  @Column({ type: 'simple-array' })
  metadataLabels: string[];

  @OneToMany(() => DistributionRule, (rule) => rule.event, {
    cascade: true,
  })
  rules: DistributionRule[];

  @OneToMany(() => Subscription, (sub) => sub.distributionEvent, {
    cascade: true,
  })
  subscriptions: Subscription[];
}
