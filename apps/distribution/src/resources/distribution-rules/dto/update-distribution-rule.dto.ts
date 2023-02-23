import { PartialType } from '@nestjs/swagger';
import { CreateDistributionJobDto } from '../../distribution-job/dto/create-distribution-job.dto';

export class UpdateDistributionRuleDto extends PartialType(
  CreateDistributionJobDto,
) {}
