import { Controller } from '@nestjs/common';
import { DistributionRuleService } from './distribution-rule.service';

@Controller('distribution-rule')
export class DistributionRuleController {
  constructor(private readonly distributionRuleService: DistributionRuleService) {}
}
