import { PartialType } from '@nestjs/swagger';
import { CreateDistributionRuleDto } from './create-distribution-rule.dto';

export class UpdateDistributionRuleDto extends PartialType(
  CreateDistributionRuleDto,
) {}
