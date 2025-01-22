import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export abstract class SubscriptionRepository {
  abstract findAll(): Promise<Subscription[]>;
  abstract findOne(
    eventType: string,
    subscriberId: string,
  ): Promise<Subscription>;
  abstract create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription>;
  abstract update(
    eventType: string,
    subscriberId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription>;
  abstract removeAll(subscriberId: string): Promise<void>;
  abstract remove(eventType: string, subscriberId: string): Promise<void>;
}
