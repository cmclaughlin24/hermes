import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import { DistributionEventExists } from '../../../common/decorators/distribution-event-exists.decorator';
import { FilterJoinOps } from '../../../common/types/filter.types';
import { SubscriptionFilterDto } from './subscription-filter.dto';

export class CreateSubscriptionDto {
  @IsUUID('4')
  id: string;

  @IsString()
  queue: string;

  @IsString()
  @IsNotEmpty()
  @DistributionEventExists()
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
