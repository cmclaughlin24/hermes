import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FilterJoinOps } from '../../../common/types/filter.type';
import {
  SubscriptionData,
  SubscriptionType,
} from '../../../common/types/subscription-type.type';
import { SubscriptionFilterDto } from './subscription-filter.dto';

export class CreateSubscriptionDto {
  @ApiProperty({
    description:
      'An identifer provided by the subscribing service used to identify the subscription ' +
      'and retrieve the subscribers (if applicable)',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  subscriberId: string;

  @ApiProperty({
    description: 'Name of the event the subscription applies to',
  })
  @IsString()
  @IsNotEmpty()
  // Todo: Renable after solution for E2E Tests can be identified. @DistributionEventExists()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  eventType: string;

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
