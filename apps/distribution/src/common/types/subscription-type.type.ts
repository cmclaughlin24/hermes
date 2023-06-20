import { PushSubscriptionDto } from '@hermes/common';
import { UserSubscriptionDto } from '../dto/user-subscription.dto';

export enum SubscriptionType {
  /**
   * Indicates the subscription's `data` property is a `UserSubscriptionDto`.
   */
  USER = 'user',

  /**
   * Indicates the subscription's `data` property is a `PushSubscriptionDto`.
   */
  PUSH = 'push',

  /**
   * Indicates the subscription's `data` property is a `RequestSubscriptionDto`.
   */
  REQUEST = 'request',
}

// Todo: Create SubscriptionRequestDto.
export type SubscriptionData = PushSubscriptionDto | UserSubscriptionDto | any;
