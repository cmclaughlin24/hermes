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
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  queue: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  messageType: string;

  @IsString({ each: true })
  @IsOptional()
  metadataLabels: string[];

  @ValidateNested()
  @ArrayMinSize(1)
  @Type(() => DistributionEventRuleDto)
  rules: DistributionEventRuleDto[];
}
