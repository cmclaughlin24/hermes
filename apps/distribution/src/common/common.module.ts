import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DistributionRuleModule } from '../resources/distribution-rule/distribution-rule.module';
import { DistributionRuleExistsRule } from './decorators/distribution-rule-exists.decorator';
import { SubscriptionMemberService } from './providers/subscription-member/subscription-member.service';

@Module({
  imports: [HttpModule, DistributionRuleModule],
  providers: [DistributionRuleExistsRule, SubscriptionMemberService],
  exports: [SubscriptionMemberService],
})
export class CommonModule {}
