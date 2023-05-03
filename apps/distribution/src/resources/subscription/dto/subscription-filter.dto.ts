import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsString, Matches, ValidateNested } from 'class-validator';
import { SubscriptionFilterOps } from '../../../common/constants/subscription-filter.constants';
import { SubscriptionQueryDto } from './subscription-query.dto';

export class SubscriptionFilterDto {
  @ApiProperty({
    description:
      'Object key to run filter against. (Nested keys delimited by ".", Array\'s delimited by "*")',
    example: 'key.key',
  })
  @IsString()
  @Matches(/^(([a-zA-Z0-9](\.)?)*)+$/)
  field: string;

  @ApiProperty({
    description: 'Operator to use for the filter.',
    enum: SubscriptionFilterOps,
  })
  @IsEnum(SubscriptionFilterOps)
  operator: SubscriptionFilterOps;

  @ValidateNested()
  @Type(() => SubscriptionQueryDto)
  query: SubscriptionQueryDto;
}
