import { PushNotificationDto, PushSubscriptionDto } from '@hermes/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreatePushNotificationDto {
  @ValidateNested()
  @Type(() => PushSubscriptionDto)
  subscription: PushSubscriptionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PushNotificationDto)
  notification?: PushNotificationDto;

  @ApiProperty({
    description: 'Name of push notification template',
    example: 'order-confirmation',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  template?: string;

  @ApiProperty({
    description: 'Values to be injected into the push notification template',
    example: {
      firstName: 'John',
      lastName: 'Doe',
      message: {
        type: 'push notification',
      },
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  context?: any;
}
