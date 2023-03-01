import { SubscriptionFilterJoinOps } from '../../../common/constants/subscription-filter.constants';
import { SubscriptionFilterDto } from './subscription-filter.dto';

export class CreateSubscriptionDto {
  queue: string;

  rule: string;

  url: string;

  filterJoin: SubscriptionFilterJoinOps;

  filters: SubscriptionFilterDto[];
}
