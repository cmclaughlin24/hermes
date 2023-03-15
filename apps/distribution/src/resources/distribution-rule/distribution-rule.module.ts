import { Module } from '@nestjs/common';
import { DistributionRuleController } from './distribution-rule.controller';
import { DistributionRuleService } from './distribution-rule.service';

@Module({
  controllers: [DistributionRuleController],
  providers: [DistributionRuleService],
  exports: [DistributionRuleService]
})
export class DistributionRuleModule {}
