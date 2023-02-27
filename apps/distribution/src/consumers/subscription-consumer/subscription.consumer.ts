import { Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

@Processor('distribution_subscription')
export class SubscriptionConsumer {
  private readonly logger = new Logger(SubscriptionConsumer.name);

  constructor() {}
}