import { DeliveryMethods, Platform, PushSubscriptionDto } from '@hermes/common';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsTimeZone, ValidateNested } from 'class-validator';

export class DeviceSubscriptionDto {
  @ApiProperty({
    description: 'Computing platform where the push notification will be delivered',
    enum: [Platform.ANDROID, Platform.IOS, Platform.WEB],
  })
  @IsEnum(Platform)
  platform: Platform;

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
      'Time zone to use when formatting dates/times (overridden if distribution rule has a "timeZone" key)',
    example: 'America/Chicago',
  })
  @IsTimeZone()
  timeZone: string;

  @ApiHideProperty()
  @IsEnum(DeliveryMethods, { each: true })
  deliveryMethods: DeliveryMethods[] = [DeliveryMethods.PUSH];
}
