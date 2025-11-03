import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { SubscriptionEntity } from './entities/subscription.entity';

@Injectable()
export abstract class SubscriptionRepository {
  abstract findAll(): Promise<SubscriptionEntity[]>;
  abstract findOne(
    eventType: string,
    subscriberId: string,
  ): Promise<SubscriptionEntity>;
  abstract create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionEntity>;
  abstract update(
    eventType: string,
    subscriberId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionEntity>;
  abstract removeAll(subscriberId: string): Promise<void>;
  abstract remove(eventType: string, subscriberId: string): Promise<void>;
}
