import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { DistributionEventExists } from '../../../common/decorators/distribution-event-exists.decorator';
import { FilterJoinOps } from '../../../common/types/filter.type';
import {
  SubscriptionData,
  SubscriptionType,
} from '../../../common/types/subscription-type.type';
import { SubscriptionFilterDto } from './subscription-filter.dto';

export class CreateSubscriptionDto {
  @ApiProperty({
    description:
      'Universal Unique Identifier (UUID) to identify the subscription',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Name of the Rabbitmq queue the message is consumed from',
  })
  @IsString()
  queue: string;

  @ApiProperty({
    description: 'Name of the message (event) the subscription applies to',
  })
  @IsString()
  @IsNotEmpty()
  @DistributionEventExists()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  messageType: string;

  @ApiProperty({
    description:
      'Type of the subscription. Controls how the "data" property is evaluated',
  })
  @IsEnum(SubscriptionType)
  subscriptionType: SubscriptionType;

  @ApiProperty({
    description:
      "Information about the subscription's member(s) that is used to reduced the " +
      'subscription to notification recipient(s) for a message',
  })
  @IsObject()
  data: SubscriptionData;

  @ApiProperty({
    description: 'Method used to join the subscription filter(s)',
    enum: FilterJoinOps,
  })
  @IsEnum(FilterJoinOps)
  filterJoin: FilterJoinOps;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionFilterDto)
  filters?: SubscriptionFilterDto[];
}
