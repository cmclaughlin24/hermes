import { DeliveryMethods } from '@hermes/common';
import { DeliveryWindow } from '../types/delivery-window.types';

export class SubscriptionMemberDto {
  constructor(
    public deliveryMethods: DeliveryMethods[],
    public email: string,
    public phoneNumber: string,
    public timeZone: string,
    public deliveryWindows: DeliveryWindow[],
  ) {}

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
