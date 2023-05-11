import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { DistributionEventExists } from '../../../common/decorators/distribution-event-exists.decorator';
import { FilterJoinOps } from '../../../common/types/filter.types';
import { SubscriptionFilterDto } from './subscription-filter.dto';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Universal Unique Identifier (UUID) to identify the subscription'
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Name of the Rabbitmq queue the message is consumed from',
  })
  @IsString()
  queue: string;

  @ApiProperty({
    description: 'Name of the message (event) the subscripton applies to',
  })
  @IsString()
  @IsNotEmpty()
  @DistributionEventExists()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  messageType: string;

  @ApiProperty({})
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Method used to join the subscription filter(s)',
    enum: FilterJoinOps,
  })
  @IsEnum(FilterJoinOps)
  filterJoin: FilterJoinOps;

  @IsOptional()
  @ValidateNested()
  @Type(() => SubscriptionFilterDto)
  filters?: SubscriptionFilterDto[];
}
