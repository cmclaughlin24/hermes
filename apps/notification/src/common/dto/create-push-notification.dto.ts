import {
  Platform,
  PushNotificationDto,
  PushSubscriptionDto
} from '@hermes/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsTimeZone,
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
      'display notifications to the user (overridden if "template" property is provided)',
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
    description:
      'Name of push notification template (overrides "notification" property if provided)',
    example: 'order-confirmation',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  template?: string;

  @ApiProperty({
    description: 'Computing platform where the push notification will be delivered',
    enum: [Platform.ANDROID, Platform.IOS, Platform.WEB],
  })
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({
    description:
      'Time zone to use when formatting dates/times (overridden if "context" property has a "timeZone" property)',
    example: 'America/Chicago',
    required: false,
  })
  @IsTimeZone()
  @IsOptional()
  timeZone?: string;

  @ApiProperty({
    description: 'Values to be injected into the push notification template',
    example: {
      notificationType: 'push (web)',
      title: 'First Notification',
      receivedOn: '2023-06-05T11:06:37.459Z',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  context?: any;
}
