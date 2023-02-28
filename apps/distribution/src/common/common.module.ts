import { Module } from '@nestjs/common';
import { DistributionRuleModule } from '../resources/distribution-rule/distribution-rule.module';
import { DistributionRuleExistsRule } from './decorators/distribution-rule-exists.decorator';


@Module({
  imports: [DistributionRuleModule],
  providers: [DistributionRuleExistsRule],
})
export class CommonModule {}
