import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsEnum, IsString, Matches } from 'class-validator';
import { FilterOps } from '../../../common/types/filter.type';

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
    description: 'Operator to use for the filter',
    enum: FilterOps,
  })
  @IsEnum(FilterOps)
  operator: FilterOps;

  @ApiProperty({
    description: 'Data type of the filter "value" field',
    example: 'string',
  })
  @IsString()
  dataType: string;

  @ApiProperty({
    description: 'Value(s) to be checked for',
    example: 'The Legend of Zelda: Link to the Past',
  })
  @Allow()
  value: any;
}
