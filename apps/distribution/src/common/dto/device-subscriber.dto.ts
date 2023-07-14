import { DeliveryMethods, Platform, PushSubscriptionDto } from '@hermes/common';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, ValidateNested } from 'class-validator';
import { DeliveryWindow } from '../types/delivery-window.type';
import { SubscriberDto } from './subscriber.dto';

export class DeviceSubscriberDto extends SubscriberDto {
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

  @ApiHideProperty()
  @IsEnum(DeliveryMethods, { each: true })
  deliveryMethods: DeliveryMethods[] = [DeliveryMethods.PUSH];

  getDeliveryMethod(deliveryMethod: DeliveryMethods): PushSubscriptionDto {
    switch (deliveryMethod) {
      case DeliveryMethods.PUSH:
        return this.subscription;
      default:
        return null;
    }
  }

  getDeliveryWindows(number: any): DeliveryWindow[] {
    return [];
  }
}
