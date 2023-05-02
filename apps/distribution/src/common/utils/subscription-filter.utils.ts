import * as flatten from 'flat';
import * as _ from 'lodash';
import { SubscriptionQueryDto } from '../../resources/subscription/dto/subscription-query.dto';
import { SubscriptionFilter } from '../../resources/subscription/entities/subscription-filter.entity';
import { Subscription } from '../../resources/subscription/entities/subscription.entity';
import {
  SubscriptionFilterJoinOps,
  SubscriptionFilterOps,
} from '../constants/subscription-filter.constants';

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
    .reduce(
      (accumulator, next) =>
        joinFilters(subscription.filterJoin, accumulator, next),
      null,
    )
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
    const keyRegex = new RegExp(keyPattern, 'g');

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

export function joinFilters(
  join: SubscriptionFilterJoinOps,
  accumulator: boolean,
  next: boolean,
): boolean {
  switch (join) {
    case SubscriptionFilterJoinOps.AND:
      return accumulator !== null ? accumulator && next : next;
    case SubscriptionFilterJoinOps.OR:
      // Note: Nullish value will be overwritten automatically by OR operator.
      return accumulator || next;
    case SubscriptionFilterJoinOps.NOT:
      // Note: Accumulator will already be have been inverted.
      return accumulator !== null ? accumulator && !next : !next;
    default:
      throw new Error(
        `Invalid Argument: Filter join operation ${join} not defined`,
      );
  }
}

export function hasArrayNotation(field: string): boolean {
  return /\.?\*\.?/g.test(field);
}

export function compare(
  operator: SubscriptionFilterOps,
  query: SubscriptionQueryDto,
  value: any,
): boolean {
  // Todo: Improve compare function by adding type conversion/validation based on the "dataType"
  //       field of the SubscriptionQueryDto.
  switch (operator) {
    case SubscriptionFilterOps.EQUALS:
      return equals(query.value, value);
    case SubscriptionFilterOps.NEQUALS:
      return nequals(query.value, value);
    case SubscriptionFilterOps.OR:
      return or(query.value, value);
    case SubscriptionFilterOps.MATCHES:
      return matches(query.value, value);
    default:
      throw new Error(
        `Invalid Argument: Comparison for operator=${operator} is not defined`,
      );
  }
}

export function equals(query: any, value: any): boolean {
  return query === value;
}

export function nequals(query: any, value: any): boolean {
  return query !== value;
}

export function or(query: any[], value: any): boolean {
  if (!Array.isArray(query)) {
    throw new Error(
      `Invalid Argument: When using OR, query must be array; recieved ${typeof query} instead`,
    );
  }
  return query.includes(value);
}

export function matches(query: string, value: string): boolean {
  if (typeof query !== 'string') {
    throw new Error(
      `Invalid Argument: When using MATCHES, query must be string; recieved ${typeof query} instead`,
    );
  }

  if (typeof value !== 'string') {
    throw new Error(
      `Invalid Argument: When using MATCHES, value must be string; recieved ${typeof value} instead`,
    );
  }

  return new RegExp(query).test(value);
}
