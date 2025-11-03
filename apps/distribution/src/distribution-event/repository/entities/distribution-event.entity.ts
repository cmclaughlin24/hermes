import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { DistributionRuleEntity } from '../../../distribution-rule/repository/entities/distribution-rule.entity';
import { SubscriptionEntity } from '../../../subscription/repository/entities/subscription.entity';

@Entity()
export class DistributionEventEntity {
  @PrimaryColumn()
  eventType: string;

  @Column({ type: 'simple-array' })
  metadataLabels: string[];

  @OneToMany(() => DistributionRuleEntity, (rule) => rule.event, {
    cascade: true,
  })
  rules: DistributionRuleEntity[];

  @OneToMany(() => SubscriptionEntity, (sub) => sub.distributionEvent, {
    cascade: true,
  })
  subscriptions: SubscriptionEntity[];
}
