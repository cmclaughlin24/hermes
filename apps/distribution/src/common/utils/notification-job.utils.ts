import { DeliveryMethods } from '@hermes/common';
import { BulkJobOptions } from 'bullmq';
import * as _ from 'lodash';
import { DateTime } from 'luxon';
import { DistributionRule } from '../../resources/distribution-rule/entities/distribution-rule.entity';
import { Recipient } from '../classes/recipient.class';
import { DistributionMessageDto } from '../dto/distribution-message.dto';
import { UserSubscriptionDto } from '../dto/user-subscription.dto';

const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;

/**
 * Yields a list of notification jobs for a list of subscription members based on the
 * distribution rule's enabled delivery method(s).
 * 
 * Note: If the messageDto has a time zone defined, dates and times in the notification
 *       templates will be displayed in this time zone instead of the recipient's time
 *       zone. This can be disabled by setting the messageDto time zone property to null.
 * 
 * @param {DistributionRule} distributionRule
 * @param {UserSubscriptionDto[]} userSubscriptions
 * @param {DistributionMessageDto} messageDto
 * @returns {{ name: string; data: any; opts?: BulkJobOptions }[]}
 */
export function createNotificationJobs(
  distributionRule: DistributionRule,
  userSubscriptions: UserSubscriptionDto[],
  messageDto: DistributionMessageDto,
): { name: string; data: any; opts?: BulkJobOptions }[] {
  return _.chain(userSubscriptions)
    .filter(
      (member) =>
        hasDeliveryMethods(distributionRule, member) &&
        hasDeliveryWindow(distributionRule, member),
    )
    .reduce(
      reduceToDeliveryMethodsMap(distributionRule.deliveryMethods),
      new Map<DeliveryMethods, Recipient[]>(),
    )
    .toPairs()
    .map(([method, recipients]) =>
      mapToNotificationJobs(
        method as DeliveryMethods,
        recipients,
        distributionRule,
        messageDto.payload,
        messageDto.timeZone,
      ),
    )
    .flatten()
    .value();
}

/**
 * Yields true if a subscription member has at least one of the distribution rule's delivery
 * method(s) enabled or false otherwise.
 * @param {DistributionRule} distributionRule
 * @param {UserSubscriptionDto} member
 * @returns {boolean}
 */
export function hasDeliveryMethods(
  distributionRule: DistributionRule,
  member: UserSubscriptionDto,
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
 * @param {UserSubscriptionDto} member
 * @returns
 */
export function hasDeliveryWindow(
  distributionRule: DistributionRule,
  member: UserSubscriptionDto,
): boolean {
  if (!distributionRule.checkDeliveryWindow) {
    return true;
  }

  const zonedNow = DateTime.now().setZone(member.timeZone);
  const deliveryWindows = member.getDeliveryWindows(zonedNow.weekday - 1);

  if (_.isEmpty(deliveryWindows)) {
    return false;
  }

  return deliveryWindows.some((window) => {
    const startTime = zonedNow.set({
      hour: window.atHour,
      minute: window.atMinute,
    });
    return isBetweenTimes(zonedNow, startTime, window.duration);
  });
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
  time: DateTime,
  startTime: DateTime,
  duration: number,
): boolean {
  const durationInMilliseconds =
    duration * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
  const endTime = startTime.plus({ milliseconds: durationInMilliseconds });

  return (
    time.diff(startTime).toObject().milliseconds >= 0 &&
    time.diff(endTime).toObject().milliseconds <= 0
  );
}

/**
 * Yields a preconfigured function with the delivery methods. The resulting preconfigured function
 * reduces a list of subscription members into a Map where the key is the delivery method and the
 * value is a Set of recipients.
 * @param {DeliveryMethods[]} deliveryMethods
 * @returns {(map: Map<DeliveryMethods, Set<string>>, member: UserSubscriptionDto) => Map<DeliveryMethods, Recipient[]>}
 */
export function reduceToDeliveryMethodsMap(
  deliveryMethods: DeliveryMethods[],
): (
  map: Map<DeliveryMethods, Recipient[]>,
  member: UserSubscriptionDto,
) => Map<DeliveryMethods, Recipient[]> {
  return (
    map: Map<DeliveryMethods, Recipient[]>,
    member: UserSubscriptionDto,
  ) => {
    for (const method of deliveryMethods) {
      const value = member.getDeliveryMethod(method);

      if (!value) {
        continue;
      }

      const recipients = map.has(method) ? map.get(method) : [];

      recipients.push(new Recipient(value, member.timeZone));
      map.set(method, recipients);
    }

    return map;
  };
}

/**
 * Yields a list of notification jobs for a delivery method's recipients. 
 * @param {DeliveryMethods} method
 * @param {Recipient[]} recipients
 * @param {DistributionRule} distributionRule
 * @param {any} payload
 * @param {string} messageTimeZone
 * @returns {{ name: string; data: any; opts?: BulkJobOptions }[]}
 */
export function mapToNotificationJobs(
  method: DeliveryMethods,
  recipients: Recipient[],
  distributionRule: DistributionRule,
  payload: any,
  messageTimeZone: string,
): { name: string; data: any; opts?: BulkJobOptions }[] {
  // Note: 'uniqWith' ensures recipients are unique based on the compartor function, which checks if a.value === b.value. This ensures 
  //       each recipient will only recieve a single notification per message (occurs if subscription member has multiple subscriptions
  //       to same distribution rule).
  return (
    _.chain(recipients)
      // Bug: If a recipient occurs twice, but with different time zones, he will recieve a notification for each delivery method but each
      //      notification may show a different time zone based on which delivery method occured first.
      .uniqWith(
        (recipientA, recipientB) => recipientA.value === recipientB.value,
      )
      .map((recipient) => {
        let data;
        const timeZone = messageTimeZone ?? recipient.timeZone;

        // Todo: Improve TypeScript support by refactoring CreateNotificationDto into @hermes library.
        switch (method) {
          case DeliveryMethods.EMAIL:
            data = {
              to: recipient.value,
              timeZone: timeZone,
              subject: distributionRule.emailSubject,
              text: distributionRule.text,
              template: distributionRule.emailTemplate,
              html: distributionRule.html,
              context: payload,
            };
            break;
          case DeliveryMethods.SMS:
            data = {
              to: recipient.value,
              timeZone: timeZone,
              template: distributionRule.smsTemplate,
              body: distributionRule.text,
              context: payload,
            };
            break;
          case DeliveryMethods.CALL:
            data = {
              to: recipient.value,
              timeZone: timeZone,
              template: distributionRule.callTemplate,
              context: payload,
            };
            break;
          default:
            throw new Error(
              `Invalid Argument: Could not map deliveryMethod=${method} to notification job`,
            );
        }

        return { name: method, data: data };
      })
      .value()
  );
}
