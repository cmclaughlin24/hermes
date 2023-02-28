import { SubscriptionFilterDto } from './subscription-filter.dto';

export class CreateSubscriptionDto {
  queue: string;

  rule: string;

  url: string;

  filters: SubscriptionFilterDto[];
}
