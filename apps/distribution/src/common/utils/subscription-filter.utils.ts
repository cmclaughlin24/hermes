import * as flatten from 'flat';
import * as _ from 'lodash';
import { SubscriptionQueryDto } from '../../resources/subscription/dto/subscription-query.dto';
import { SubscriptionFilter } from '../../resources/subscription/entities/subscription-filter.entity';
import { Subscription } from '../../resources/subscription/entities/subscription.entity';
import { FilterJoinOps, FilterOps } from '../types/filter.type';

/**
 * Yields a list of Subscriptions that should recieve a notification.
 * @param {Subscription[]} subscriptions
 * @param {any} payload
 * @returns {Subscription[]}
 */
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
    shouldNotify(subscription, payload),
  );
}

/**
 * Yields a boolean that indicates whether or not a subscription should recieve a
 * notification.
 * @param {Subscription} subscription
 * @param {Payload} payload
 * @returns {boolean}
 */
export function shouldNotify(
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

/**
 * Yields a boolean that indicates whether or not the filter criteria exists in
 * a payload.
 * @param {SubscriptionFilter} filter
 * @param {any} payload
 * @returns {boolean}
 */
export function evaluateFilter(
  filter: SubscriptionFilter,
  payload: any,
): boolean {
  const flatPayload = flatten(payload);
  let isMatch = false;

  if (!hasArrayNotation(filter.field)) {
    isMatch = compare(filter.operator, filter.query, flatPayload[filter.field]);
  } else {
    // Bug: When using an array notation, the FilterJoinOps will match across objects in arrays. For example,
    //      object.*.hello equals world and object.*.test equals test will return true object.[0].hello and
    //      object.[0].test contain the value or if object.[0].hello and object.[1].test each have one or more
    //      values.
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

/**
 * Yields a boolean that indicates the new value of the accumulator after it
 * has been joined to the next value in an array.
 *
 * Note: This function is utilized by the lodash reduce method as a callback
 *       function.
 *
 * @param {FilterJoinOps} join
 * @param {boolean} accumulator
 * @param {boolean} next
 * @returns {boolean}
 */
export function joinFilters(
  join: FilterJoinOps,
  accumulator: boolean,
  next: boolean,
): boolean {
  switch (join) {
    case FilterJoinOps.AND:
      return accumulator !== null ? accumulator && next : next;
    case FilterJoinOps.OR:
      // Note: Nullish value will be overwritten automatically by OR operator.
      return accumulator || next;
    case FilterJoinOps.NOT:
      // Note: Accumulator will already be have been inverted.
      return accumulator !== null ? accumulator && !next : !next;
    default:
      throw new Error(
        `Invalid Argument: Filter join operation ${join} not defined`,
      );
  }
}

/**
 * Yields true if the field contains array notation or false otherwise.
 * @example
 * - `*.console`
 * - `console.games.*.name`
 * - `games.tags.*`
 * @param {string} field
 * @returns {boolean}
 */
export function hasArrayNotation(field: string): boolean {
  return /\.?\*\.?/g.test(field);
}

/**
 * Yields a boolean value that indicates whether or not the value meets the
 * comparison's criteria.
 * @param {FilterOps} operator
 * @param {SubscriptionQueryDto} query
 * @param {any} value
 * @returns {boolean}
 */
export function compare(
  operator: FilterOps,
  query: SubscriptionQueryDto,
  value: any,
): boolean {
  // Todo: Improve compare function by adding type conversion/validation based on the "dataType"
  //       field of the SubscriptionQueryDto.
  let evalFn: (query: SubscriptionQueryDto, value) => boolean;

  switch (operator) {
    case FilterOps.EQUALS:
      evalFn = equals;
      break;
    case FilterOps.NEQUALS:
      evalFn = nequals;
      break;
    case FilterOps.OR:
      evalFn = or;
      break;
    case FilterOps.MATCHES:
      evalFn = matches;
      break;
    default:
      throw new Error(
        `Invalid Argument: Comparison for operator=${operator} is not defined`,
      );
  }

  return evalFn(query, value);
}

/**
 * Yields true if the value is equal to the SubscriptionQueryDto or
 * false otherwise.
 * @param {query} query
 * @param {any} value
 * @returns {boolean}
 */
export function equals(query: SubscriptionQueryDto, value: any): boolean {
  return query.value === value;
}

/**
 * Yields true if the value is not equal to the SubscriptionQueryDto or
 * false otherwise.
 * @param {SubscriptionQueryDto} query
 * @param {any} value
 * @returns {boolean}
 */
export function nequals(query: SubscriptionQueryDto, value: any): boolean {
  return query.value !== value;
}

/**
 * Yields true if the value is included in the SubscriptionQueryDto or false
 * otherwise.
 * @param {SubscriptionQueryDto} query
 * @param {any} value
 * @returns {boolean}
 */
export function or(query: SubscriptionQueryDto, value: any): boolean {
  if (!Array.isArray(query.value)) {
    throw new Error(
      `Invalid Argument: When using OR, query must be array; recieved ${typeof query.value} instead`,
    );
  }
  return query.value.includes(value);
}

/**
 * Yields true if the SubscriptionQueryDto regex pattern exists in the value or
 * false otherwise.
 * @param {SubscriptionQueryDto} query
 * @param {string} value
 * @returns {boolean}
 */
export function matches(query: SubscriptionQueryDto, value: string): boolean {
  if (typeof query.value !== 'string') {
    throw new Error(
      `Invalid Argument: When using MATCHES, query must be string; recieved ${typeof query.value} instead`,
    );
  }

  if (typeof value !== 'string') {
    throw new Error(
      `Invalid Argument: When using MATCHES, value must be string; recieved ${typeof value} instead`,
    );
  }

  return new RegExp(query.value).test(value);
}
