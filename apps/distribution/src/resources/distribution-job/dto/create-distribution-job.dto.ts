import { DistributionQueues } from '@notification/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { DistributionRuleExists } from '../../../common/decorators/distribution-rule-exists.decorator';

export class CreateDistributionJobDto {
  @IsString()
  @IsNotEmpty()
  @DistributionRuleExists()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  rule: string;

  @IsEnum(DistributionQueues)
  queue: DistributionQueues;

  @IsObject()
  payload: any;
}
