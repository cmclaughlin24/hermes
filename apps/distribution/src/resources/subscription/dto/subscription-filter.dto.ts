import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsEnum, IsString, Matches } from 'class-validator';
import { SubscriptionFilterOps } from '../../../common/constants/subscription-filter.constants';

export class SubscriptionFilterDto {
  @ApiProperty({
    description:
      'Object key to run filter against. (Nested keys delimited by ".")',
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

  @Allow()
  query: any;
}
