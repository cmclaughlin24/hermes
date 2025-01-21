import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { DistributionRule } from '../../../distribution-rule/repository/entities/distribution-rule.entity';
import { Subscription } from '../../../subscription/repository/entities/subscription.entity';

@Table({ tableName: 'distribution_event' })
export class DistributionEvent extends Model {
  @Column({ primaryKey: true })
  eventType: string;

  @Column(DataType.ARRAY(DataType.STRING))
  metadataLabels: string[];

  @HasMany(() => DistributionRule, { onDelete: 'CASCADE' })
  rules: DistributionRule[];

  @HasMany(() => Subscription, { onDelete: 'CASCADE' })
  subscriptions: Subscription[];
}
