import { Module } from '@nestjs/common';
import { DistributionRuleModule } from '../resources/distribution-rule/distribution-rule.module';
import { DistributionRuleExistsRule } from './decorators/distribution-rule-exists.decorator';
import { FilterService } from './providers/filter/filter.service';


@Module({
  imports: [DistributionRuleModule],
  providers: [DistributionRuleExistsRule, FilterService],
})
export class CommonModule {}
