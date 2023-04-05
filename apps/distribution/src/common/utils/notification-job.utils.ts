import * as _ from 'lodash';
import { DistributionRule } from '../../resources/distribution-rule/entities/distribution-rule.entity';

export function createNotificationJobs(
  distributionRule: DistributionRule,
  subscriptionMembers: any[],
  payload: any,
): any {
  return _.chain(subscriptionMembers)
    .filter((member) => hasDeliveryMethods(distributionRule, member))
    .value();
}

function hasDeliveryMethods(
  distributionRule: DistributionRule,
  member: any,
): boolean {
  return !_.isEmpty(
    _.intersection(distributionRule.deliveryMethods, member.deliveryMethods),
  );
}
