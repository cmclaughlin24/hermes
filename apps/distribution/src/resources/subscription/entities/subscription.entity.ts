import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table
} from 'sequelize-typescript';
import { FilterJoinOps } from '../../../common/types/filter.types';
import { DistributionRule } from '../../distribution-rule/entities/distribution-rule.entity';
import { SubscriptionFilter } from './subscription-filter.entity';

@Table
export class Subscription extends Model {
  @Column({
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => DistributionRule)
  distributionRuleId: string;

  @Column
  url: string;

  @Column
  filterJoin: FilterJoinOps;

  @BelongsTo(() => DistributionRule)
  distributionRule: DistributionRule;

  @HasMany(() => SubscriptionFilter, { onDelete: 'CASCADE' })
  filters: SubscriptionFilter[];
}
