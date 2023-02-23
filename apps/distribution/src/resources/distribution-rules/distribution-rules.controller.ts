import { Controller } from '@nestjs/common';
import { DistributionRulesService } from './distribution-rules.service';

@Controller('distribution-rules')
export class DistributionRulesController {
  constructor(private readonly distributionRulesService: DistributionRulesService) {}
}
