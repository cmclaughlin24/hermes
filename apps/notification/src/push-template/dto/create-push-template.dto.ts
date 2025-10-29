import { PushNotificationDto } from '@hermes/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePushTemplateDto extends PartialType(PushNotificationDto) {
  @ApiProperty({
    description: 'Name of the push notification template',
    example: 'template',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;
}
