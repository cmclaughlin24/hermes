import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './create-subscription.dto';

export class UpdateSubscriptionDto extends OmitType(
  PartialType(CreateSubscriptionDto),
  ['queue', 'eventType', 'subscriberId', 'subscriptionType'],
) {}
