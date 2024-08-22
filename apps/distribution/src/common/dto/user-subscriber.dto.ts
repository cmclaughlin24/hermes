import { DeliveryMethods } from '@hermes/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  Allow,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber
} from 'class-validator';
import { DeliveryWindow } from '../types/delivery-window.type';
import { SubscriberDto } from './subscriber.dto';

export class UserSubscriberDto extends SubscriberDto {
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
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Phone number to deliver notifications to',
    example: '+19999999999',
  })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

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
        return null;
    }
  }

  getDeliveryWindows(dayOfWeek: number): DeliveryWindow[] {
    return this.deliveryWindows?.filter(
      (window) => window.dayOfWeek <= dayOfWeek,
    );
  }
}
