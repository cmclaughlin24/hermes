import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionMemberService {
  constructor(private readonly httpClient: HttpService) {}

  async get(subscriptions: any[]) {
    return [];
  }
}
