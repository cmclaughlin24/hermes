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
  @ApiProperty({
    description:
      'The PushSubscription interface of the PUSH API provides the subscriptions URL ' +
      'endpoint and allows unsubscribing from a push service',
    externalDocs: {
      description: 'PushSubscription (MDN)',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription',
    },
  })
  @ValidateNested()
  @Type(() => PushSubscriptionDto)
  subscription: PushSubscriptionDto;

  @ApiProperty({
    description:
      'The Notification interface of the Notification API used to display configure ' +
      'display notifications to the user',
    externalDocs: {
      description: 'Notification (MDN)',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/notification',
    },
  })
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
