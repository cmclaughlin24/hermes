import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DistributionRuleModule } from '../resources/distribution-rule/distribution-rule.module';
import { DistributionRuleExistsRule } from './decorators/distribution-rule-exists.decorator';
import { SubscriptionFilterService } from './providers/subscription-filter/subscription-filter.service';
import { SubscriptionMemberService } from './providers/subscription-member/subscription-member.service';

@Module({
  imports: [HttpModule, DistributionRuleModule],
  providers: [
    DistributionRuleExistsRule,
    SubscriptionFilterService,
    SubscriptionMemberService,
  ],
  exports: [SubscriptionFilterService, SubscriptionMemberService],
})
export class CommonModule {}
