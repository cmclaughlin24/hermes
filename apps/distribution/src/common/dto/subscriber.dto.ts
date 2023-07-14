import { DeliveryMethods } from '@hermes/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsTimeZone } from 'class-validator';
import { DeliveryWindow } from '../types/delivery-window.type';

export abstract class SubscriberDto {
  @ApiProperty({
    description:
      'Time zone to use when formatting dates/times (overridden if distribution rule has a "timeZone" key)',
    example: 'America/Chicago',
  })
  @IsTimeZone()
  timeZone: string;

  abstract deliveryMethods: DeliveryMethods[];

  abstract getDeliveryMethod(deliveryMethod: DeliveryMethods): any;

  abstract getDeliveryWindows(dayOfWeek: number): DeliveryWindow[]; 
}