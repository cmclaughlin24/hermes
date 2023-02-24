import { DeliveryMethods, DistributionQueues } from '@notification/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateDistributionRuleDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @IsEnum(DistributionQueues)
  queue: DistributionQueues;

  @IsEnum(DeliveryMethods, { each: true })
  deliveryMethods: DeliveryMethods[];
}
