import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { DistributionRule } from '../../distribution-rule/entities/distribution-rule.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';

@Table({
  indexes: [
    {
      unique: true,
      fields: ['queue', 'eventType'],
    },
  ],
})
export class DistributionEvent extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column
  queue: string;

  @Column
  eventType: string;

  @Column(DataType.ARRAY(DataType.STRING))
  metadataLabels: string[];

  @HasMany(() => DistributionRule, { onDelete: 'CASCADE' })
  rules: DistributionRule[];

  @HasMany(() => Subscription, { onDelete: 'CASCADE' })
  subscriptions: Subscription[];
}
