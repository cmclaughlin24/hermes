import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsString, Matches } from 'class-validator';

export class SubscriptionFilterDto {
  @ApiProperty({
    description:
      'Field to run filter against. (Nested fields delimited by ".")',
  })
  @Matches(/^(([a-zA-Z0-9](\.)?)*)+$/)
  field: string;

  @ApiProperty({
    description: 'Operator to use for the filter.',
  })
  @IsString()
  operator: string;

  @Allow()
  query: any;
}