import { DeliveryMethods } from '@notification/common';
import { BulkJobOptions } from 'bullmq';
import * as _ from 'lodash';
import { DistributionRule } from '../../resources/distribution-rule/entities/distribution-rule.entity';
import { SubscriptionMemberDto } from '../dto/subscription-member.dto';

export function createNotificationJobs(
  distributionRule: DistributionRule,
  subscriptionMembers: SubscriptionMemberDto[],
  payload: any,
): any {
  return _.chain(subscriptionMembers)
    .filter((member) => hasDeliveryMethods(distributionRule, member))
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

export function hasDeliveryMethods(
  distributionRule: DistributionRule,
  member: SubscriptionMemberDto,
): boolean {
  return !_.isEmpty(
    _.intersection(distributionRule.deliveryMethods, member.deliveryMethods),
  );
}

export function reduceToDeliveryMethodsMap(deliveryMethods: DeliveryMethods[]) {
  return (
    map: Map<DeliveryMethods, Set<string>>,
    member: SubscriptionMemberDto,
  ) => {
    for (const method of deliveryMethods) {
      const value = member.get(method);

      if (!value) {
        continue;
      }

      const recipients = map.has(method) ? map.get(method) : new Set<string>();

      recipients.add(value);
      map.set(method, recipients);
    }

    return map;
  };
}

export function mapToNotificationJobs(
  method: DeliveryMethods,
  recipients: Set<string>,
  distributionRule: DistributionRule,
  payload: any,
): { name: string; data: any; opts?: BulkJobOptions }[] {
  return Array.from(recipients).map((recipient) => {
    return { name: method, data: { to: recipient } };
  });
}
