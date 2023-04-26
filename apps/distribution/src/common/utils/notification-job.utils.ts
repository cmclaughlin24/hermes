import { DeliveryMethods } from '@notification/common';
import { BulkJobOptions } from 'bullmq';
import { utcToZonedTime } from 'date-fns-tz';
import * as _ from 'lodash';
import { DistributionRule } from '../../resources/distribution-rule/entities/distribution-rule.entity';
import { SubscriptionMemberDto } from '../dto/subscription-member.dto';

const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;

/**
 * Yields a list of notification jobs for a list of subscription members based on the
 * distribution rule's enabled delivery method(s).
 * @param {DistributionRule} distributionRule
 * @param {SubscriptionMemberDto[]} subscriptionMembers
 * @param {any} payload
 * @returns {{ name: string; data: any; opts?: BulkJobOptions }[]}
 */
export function createNotificationJobs(
  distributionRule: DistributionRule,
  subscriptionMembers: SubscriptionMemberDto[],
  payload: any,
): { name: string; data: any; opts?: BulkJobOptions }[] {
  return _.chain(subscriptionMembers)
    .filter(
      (member) =>
        hasDeliveryMethods(distributionRule, member) &&
        hasDeliveryWindow(distributionRule, member),
    )
    .reduce(
      reduceToDeliveryMethodsMap(distributionRule.deliveryMethods),
      new Map<DeliveryMethods, Set<string>>(),
    )
    .toPairs()
    .map(([method, recipients]) =>
      mapToNotificationJobs(
        method as DeliveryMethods,
        recipients,
        distributionRule,
        payload,
      ),
    )
    .flatten()
    .value();
}

/**
 * Yields true if a subscription member has at least one of the distribution rule's delivery
 * method(s) enabled or false otherwise.
 * @param {DistributionRule} distributionRule
 * @param {SubscriptionMemberDto} member
 * @returns {boolean}
 */
export function hasDeliveryMethods(
  distributionRule: DistributionRule,
  member: SubscriptionMemberDto,
): boolean {
  return !_.isEmpty(
    // Example: _.intersection(['email'], ['email', 'sms']) => ['email']
    _.intersection(distributionRule.deliveryMethods, member.deliveryMethods),
  );
}

/**
 * Yields true if the current day and time falls within a subscription member's delivery window settings
 * or if the distribution rule does not check the delivery window. Yields false otherwise.
 * @param {DistributionRule} distributionRule
 * @param {SubscriptionMemberDto} member
 * @returns
 */
export function hasDeliveryWindow(
  distributionRule: DistributionRule,
  member: SubscriptionMemberDto,
): boolean {
  if (!distributionRule.checkDeliveryWindow) {
    return true;
  }

  const zoneNow = utcToZonedTime(new Date(), member.timeZone);
  const deliveryWindow = member.getDeliveryWindow(zoneNow.getDay());

  if (!deliveryWindow) {
    return false;
  }

  const startTime = new Date();
  startTime.setDate(zoneNow.getDate());
  startTime.setHours(deliveryWindow.atHour);
  startTime.setMinutes(deliveryWindow.atMinute);

  return isBetweenTimes(zoneNow, startTime, deliveryWindow.duration);
}

/**
 * Yields true if the time argument is greater than or equal to the start time and less than or equal
 * to the end time (startTime + duration in minutes) or false otherwise.
 * @param {Date} time
 * @param {Date} startTime
 * @param {number} duration
 * @returns {boolean}
 */
export function isBetweenTimes(
  time: Date,
  startTime: Date,
  duration: number,
): boolean {
  const durationInMilliseconds =
    duration * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
  const endTime = new Date(startTime.getTime() + durationInMilliseconds);

  return (
    time.getTime() >= startTime.getTime() && time.getTime() <= endTime.getTime()
  );
}

/**
 * Yields a preconfigured function with the delivery methods. The resulting preconfigured function
 * reduces a list of subscription members into a Map where the key is the delivery method and the
 * value is a Set of recipients.
 * @param {DeliveryMethods[]} deliveryMethods
 * @returns {(map: Map<DeliveryMethods, Set<string>>, member: SubscriptionMemberDto) => Map<DeliveryMethods, Set<string>>}
 */
export function reduceToDeliveryMethodsMap(
  deliveryMethods: DeliveryMethods[],
): (
  map: Map<DeliveryMethods, Set<string>>,
  member: SubscriptionMemberDto,
) => Map<DeliveryMethods, Set<string>> {
  return (
    map: Map<DeliveryMethods, Set<string>>,
    member: SubscriptionMemberDto,
  ) => {
    for (const method of deliveryMethods) {
      const value = member.getDeliveryMethod(method);

      if (!value) {
        continue;
      }

      // Note: Recipients are added to a Set to ensure a recipient will only recieve a single notification per
      //       message (occurs if subscription member has multiple subscriptions to same distribution rule).
      const recipients = map.has(method) ? map.get(method) : new Set<string>();

      recipients.add(value);
      map.set(method, recipients);
    }

    return map;
  };
}

/**
 * Yields a list of notification jobs for a delivery method's recipients.
 * @param {DeliveryMethods} method
 * @param {Set<string>} recipients
 * @param {DistributionRule} distributionRule
 * @param {any} payload
 * @returns {{ name: string; data: any; opts?: BulkJobOptions }[]}
 */
export function mapToNotificationJobs(
  method: DeliveryMethods,
  recipients: Set<string>,
  distributionRule: DistributionRule,
  payload: any,
): { name: string; data: any; opts?: BulkJobOptions }[] {
  return Array.from(recipients).map((recipient) => {
    let data;

    // Todo: Improve TypeScript support by refactoring CreateNotificationDto into @notification library.
    switch (method) {
      case DeliveryMethods.EMAIL:
        data = {
          to: recipient,
          subject: distributionRule.emailSubject,
          text: distributionRule.text,
          template: distributionRule.emailTemplate,
          html: distributionRule.html,
          context: payload,
        };
        break;
      case DeliveryMethods.SMS:
        data = {
          to: recipient,
          body: distributionRule.text,
          context: payload,
        };
        break;
      default:
        throw new Error(
          `Invalid Argument: Could not map deliveryMethod=${method} to notification job`,
        );
    }

    return { name: method, data: data };
  });
}