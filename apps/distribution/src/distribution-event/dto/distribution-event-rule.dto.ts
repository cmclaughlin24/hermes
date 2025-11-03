import { OmitType } from '@nestjs/swagger';
import { CreateDistributionRuleDto } from '../../distribution-rule/dto/create-distribution-rule.dto';

export class DistributionEventRuleDto extends OmitType(
  CreateDistributionRuleDto,
  ['eventType'],
) {}
