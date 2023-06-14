import { PushSubscriptionDto } from '@hermes/common';
import { SubscriptionMemberDto } from '../dto/subscription-member.dto';

export enum SubscriptionType {
  /**
   * Indicates the subscription's `data` property is a `SubscriptionMemberDto`.
   */
  MEMBER = 'member',
  /**
   * Indicates the subscription's `data` property is a `PushSubscriptionDto`.
   */
  PUSH = 'push',
  /**
   * Indicates the subscription's `data` property is a `SubscriptionRequestDto`.
   */
  REQUEST = 'request',
}

export type SubscriptionData =
  | PushSubscriptionDto
  | SubscriptionMemberDto
  | any;
