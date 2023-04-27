import * as flatten from 'flat';
import * as _ from 'lodash';
import { SubscriptionFilter } from '../../resources/subscription/entities/subscription-filter.entity';
import { Subscription } from '../../resources/subscription/entities/subscription.entity';
import { SubscriptionFilterOps } from '../constants/subscription-filter.constants';

export function filterSubscriptions(
  subscriptions: Subscription[],
  payload: any,
): Subscription[] {
  if (_.isEmpty(subscriptions)) {
    return [];
  }

  // Note: If the payload is null/undefined, send a notification to all subscriptions (case where
  //       templates do not inject any values into the templates).
  if (!payload) {
    return subscriptions;
  }

  return subscriptions.filter((subscription) =>
    hasFilterMatch(subscription, payload),
  );
}

export function hasFilterMatch(
  subscription: Subscription,
  payload: any,
): boolean {
  // Note: If a subscription does not have filters, assume the subscription should
  //       recieve a notification.
  if (_.isEmpty(subscription.filters)) {
    return true;
  }

  return _.chain(subscription.filters)
    .map((filter) => evaluateFilter(filter, payload))
    .uniq()
    .reduce((accumulator, result) => {
      if (accumulator === null) {
        return result;
      }

      // Fixme: Evaluate accumulator and result based on the filter join operation defined in the subscription.
      return accumulator && result;
    }, null)
    .value();
}

export function evaluateFilter(
  filter: SubscriptionFilter,
  payload: any,
): boolean {
  const flatPayload = flatten(payload);
  let isMatch = false;

  if (!hasArrayNotation(filter.field)) {
    isMatch = compare(filter.operator, filter.query, flatPayload[filter.field]);
  } else {
    const keyPattern = '^' + filter.field.replace('*', '[0-9]+') + '$';
    const keyRegex = new RegExp(keyPattern);

    for (const key of Object.keys(flatPayload)) {
      if (!keyRegex.test(key)) {
        continue;
      }

      isMatch = compare(filter.operator, filter.query, flatPayload[key]);
    
      if (isMatch) {
        break;
      }
    }
  }

  return isMatch;
}

export function hasArrayNotation(field: string): boolean {
  return /\.?\*\.?/g.test(field);
}

export function compare(
  operator: SubscriptionFilterOps,
  x: any,
  y: any,
): boolean {
  // Fixme: Evaluate values based on the fitler operator.
  return true;
}
