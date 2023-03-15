import { DeliveryMethods } from '@notification/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateDistributionRuleDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  queue: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  event: string;

  @IsEnum(DeliveryMethods, { each: true })
  deliveryMethods: DeliveryMethods[];
}
