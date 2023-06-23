import { SubscriptionDataDto } from '../dto/subscription-data.dto';

export class Recipient {
  constructor(
    /**
     * Value of a delivery method that will recieve a notification.
     */
    public value: any,
    /**
     * Subscription data the recipient was created from.
     */
    public subscription: SubscriptionDataDto,
  ) {}
}
