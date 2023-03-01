import { Module } from '@nestjs/common';
import { DistributionRuleModule } from '../resources/distribution-rule/distribution-rule.module';
import { DistributionRuleExistsRule } from './decorators/distribution-rule-exists.decorator';
import { SubscriptionFilterService } from './providers/subscription-filter/subscription-filter.service';

@Module({
  imports: [DistributionRuleModule],
  providers: [DistributionRuleExistsRule, SubscriptionFilterService],
  exports: [SubscriptionFilterService],
})
export class CommonModule {}
