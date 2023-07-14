import { SubscriberDto } from '../dto/subscriber.dto';

export class Recipient {
  constructor(
    /**
     * Value of a delivery method that will recieve a notification.
     */
    public value: any,
    /**
     * Subscription data the recipient was created from.
     */
    public subscription: SubscriberDto,
  ) {}
}
