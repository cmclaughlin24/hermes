import { DistributionQueues } from '@notification/common';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { SubscriptionFilterJoinOps } from '../../../common/constants/subscription-filter.constants';
import { DistributionRuleExists } from '../../../common/decorators/distribution-rule-exists.decorator';
import { SubscriptionFilterDto } from './subscription-filter.dto';

export class CreateSubscriptionDto {
  @IsEnum(DistributionQueues)
  queue: DistributionQueues;

  @IsString()
  @IsNotEmpty()
  @DistributionRuleExists()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  rule: string;

  @IsUUID('4')
  id: string;

  @IsString()
  url: string;

  @IsEnum(SubscriptionFilterJoinOps)
  filterJoin: SubscriptionFilterJoinOps;

  @IsOptional()
  @ValidateNested()
  @Type(() => SubscriptionFilterDto)
  filters: SubscriptionFilterDto[];
}
