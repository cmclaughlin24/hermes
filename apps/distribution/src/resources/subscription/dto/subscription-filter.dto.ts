import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsString, Matches, ValidateNested } from 'class-validator';
import { FilterOps } from '../../../common/types/filter.types';
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
    enum: FilterOps,
  })
  @IsEnum(FilterOps)
  operator: FilterOps;

  @ValidateNested()
  @Type(() => SubscriptionQueryDto)
  query: SubscriptionQueryDto;
}
