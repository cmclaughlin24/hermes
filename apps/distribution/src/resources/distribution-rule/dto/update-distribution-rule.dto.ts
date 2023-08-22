import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDistributionRuleDto } from './create-distribution-rule.dto';

export class UpdateDistributionRuleDto extends OmitType(
  PartialType(
  CreateDistributionRuleDto,
), ['queue', 'eventType']) {}
