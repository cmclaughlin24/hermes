import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { Allow, IsNotEmpty, IsString } from 'class-validator';

export class SubscriptionQueryDto {
  @ApiProperty({ description: '' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  dataType: string;

  @ApiProperty({ description: '' })
  @Allow()
  value: any;
}
