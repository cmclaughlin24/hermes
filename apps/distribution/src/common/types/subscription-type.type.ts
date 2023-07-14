import { DeviceSubscriberDto } from '../dto/device-subscriber.dto';
import { RequestSubscriberDto } from '../dto/request-subscriber.dto';
import { UserSubscriberDto } from '../dto/user-subscriber.dto';

export enum SubscriptionType {
  /**
   * Indicates the subscription's `data` property is a `UserSubscriberDto`.
   */
  USER = 'user',

  /**
   * Indicates the subscription's `data` property is a `DeviceSubscriberDto`.
   */
  DEVICE = 'device',

  /**
   * Indicates the subscription's `data` property is a `RequestSubscriberDto`.
   */
  REQUEST = 'request',
}

export type SubscriptionData =
  | DeviceSubscriberDto
  | UserSubscriberDto
  | RequestSubscriberDto;
