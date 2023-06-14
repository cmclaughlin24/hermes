import { DeliveryMethods } from '@hermes/common';
import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsEmail, IsEnum, IsPhoneNumber, IsTimeZone } from 'class-validator';
import { DeliveryWindow } from '../types/delivery-window.type';

export class SubscriptionMemberDto {
  @ApiProperty({
    description: 'How to deliver notifications for an event',
    enum: DeliveryMethods,
    example: [DeliveryMethods.EMAIL, DeliveryMethods.SMS, DeliveryMethods.CALL],
  })
  @IsEnum(DeliveryMethods, { each: true })
  deliveryMethods: DeliveryMethods[];

  @ApiProperty({
    description: 'Email address to deliver notifications to',
    example: 'example@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number to deliver notifications to',
    example: '+19999999999',
  })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    description:
      'Time zone to use when formatting dates/times (overridden if distribution rule has a "timeZone" key)',
    example: 'America/Chicago',
  })
  @IsTimeZone()
  timeZone: string;

  @Allow()
  deliveryWindows: DeliveryWindow[];

  getDeliveryMethod(deliveryMethod: DeliveryMethods): string {
    switch (deliveryMethod) {
      case DeliveryMethods.EMAIL:
        return this.email;
      case DeliveryMethods.SMS:
        return this.phoneNumber;
      case DeliveryMethods.CALL:
        return this.phoneNumber;
      default:
        throw new Error(
          `Invalid Argument: Retrieval for ${deliveryMethod} contact information not defined`,
        );
    }
  }

  getDeliveryWindows(dayOfWeek: number): DeliveryWindow[] {
    return this.deliveryWindows?.filter(
      (window) => window.dayOfWeek === dayOfWeek,
    );
  }
}
