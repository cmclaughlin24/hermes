import { Injectable, Logger } from '@nestjs/common';
import * as _ from 'lodash';
import { SubscriptionFilter } from '../../../resources/subscription/entities/subscription-filter.entity';
import { Subscription } from '../../../resources/subscription/entities/subscription.entity';
import { SubscriptionFilterJoinOps, SubscriptionFilterOps } from '../../constants/subscription-filter.constants';

@Injectable()
export class SubscriptionFilterService {
  private readonly logger = new Logger(SubscriptionFilterService.name);

  constructor() {}

  filter(subscriptions: Subscription[], payload: any): Subscription[] {
    if (_.isEmpty(subscriptions)) {
      return [];
    }

    return subscriptions.filter((subscription) =>
      this.isSubscribed(subscription, payload),
    );
  }

  isSubscribed(subscription: Subscription, payload: any): boolean {
    let isSubscribed = true;

    // Note: If a subscription does not have filters, assume the subscription
    //       is subscribed.
    if (_.isEmpty(subscription.filters)) {
      return true;
    }

    const filterResults = subscription.filters.map((filter) =>
      this._evaluateFilter(filter, payload),
    );

    switch (subscription.filterJoin) {
      case SubscriptionFilterJoinOps.AND:
        isSubscribed = filterResults.every(result => result);
        break;
      case SubscriptionFilterJoinOps.OR:
        isSubscribed = filterResults.includes(true);
        break;
      case SubscriptionFilterJoinOps.NOT:
        isSubscribed = !filterResults.every(result => result);
        break;
    }

    return isSubscribed;
  }

  private _evaluateFilter(filter: SubscriptionFilter, payload: any): boolean {
    const keys = this._getKeys(filter.field);

    switch (filter.operator) {
      case SubscriptionFilterOps.EQUALS:
        break;
      case SubscriptionFilterOps.NEQUALS:
        break;
      case SubscriptionFilterOps.OR:
        break;
      case SubscriptionFilterOps.MATCHES:
        break;
    }

    return true;
  }

  private _getKeys(field: string): string[] {
    if (!field || field.trim() === '') {
      throw new Error(
        'Invalid Argument: subscription filter "field" cannot be null, undefined, or an empty string',
      );
    }

    return field.split('.');
  }
}
