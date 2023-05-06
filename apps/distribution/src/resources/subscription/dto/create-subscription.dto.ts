import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import { FilterJoinOps } from '../../../common/constants/filter.constants';
import { DistributionRuleExists } from '../../../common/decorators/distribution-rule-exists.decorator';
import { SubscriptionFilterDto } from './subscription-filter.dto';

export class CreateSubscriptionDto {
  @IsUUID('4')
  id: string;

  @IsString()
  queue: string;

  @IsString()
  @IsNotEmpty()
  @DistributionRuleExists()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  messageType: string;

  @IsString()
  url: string;

  @IsEnum(FilterJoinOps)
  filterJoin: FilterJoinOps;

  @IsOptional()
  @ValidateNested()
  @Type(() => SubscriptionFilterDto)
  filters?: SubscriptionFilterDto[];
}
