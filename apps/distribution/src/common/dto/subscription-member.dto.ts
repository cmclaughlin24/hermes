import { DeliveryMethods } from '@notification/common';

interface DeliveryWindow {
  dayOfWeek: number;
  atHour: number;
  atMinute: number;
  duration: number;
}

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
    }

    return null;
  }

  getDeliveryWindows(dayOfWeek: number): DeliveryWindow[] {
    return this.deliveryWindows?.filter(
      (window) => window.dayOfWeek === dayOfWeek,
    );
  }
}
