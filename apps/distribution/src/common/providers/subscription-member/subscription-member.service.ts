import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Subscription } from '../../../resources/subscription/entities/subscription.entity';

@Injectable()
export class SubscriptionMemberService {
  constructor(private readonly httpClient: HttpService) {}

  async get(subscriptions: Subscription[]) {
    return [];
  }
}
