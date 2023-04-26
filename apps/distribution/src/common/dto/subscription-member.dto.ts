import { DeliveryMethods } from '@notification/common';

export class SubscriptionMemberDto {
  constructor(
    public deliveryMethods: DeliveryMethods[],
    public email: string,
    public phoneNumber: string,
    public timeZone: string,
  ) {}

  getDeliveryMethod(deliveryMethod: DeliveryMethods): string {
    switch (deliveryMethod) {
      case DeliveryMethods.EMAIL:
        return this.email;
      case DeliveryMethods.SMS:
        return this.phoneNumber;
    }

    return null;
  }

  getDeliveryWindow(dayOfWeek: number): any {
    // Fixme: Implement getDeliveryWindow method.
  }
}
