import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DistributionEventRuleDto } from './distribution-event-rule.dto';

export class CreateDistributionEventDto {
  @ApiProperty({
    description: 'Type of the event',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  eventType: string;

  @ApiProperty({
    description:
      'Labels that should be checked to identify which rule should be applied for an event (for a ' +
      'rule to be selected, all selectors must match or the default rule will be applied)',
    example: ['languageCode']
  })
  @IsString({ each: true })
  @IsOptional()
  metadataLabels: string[];

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => DistributionEventRuleDto)
  rules: DistributionEventRuleDto[];
}
