import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import * as _ from 'lodash';
import { firstValueFrom, forkJoin, Observable } from 'rxjs';
import { Subscription } from '../../../resources/subscription/entities/subscription.entity';

@Injectable()
export class SubscriptionMemberService {
  private readonly logger = new Logger(SubscriptionMemberService.name);

  constructor(private readonly httpClient: HttpService) {}

  async get(subscriptions: Subscription[]): Promise<any[]> {
    const requests = this._mapSubscriptionsToRequest(subscriptions);

    try {
      await firstValueFrom(forkJoin(requests));
    } catch (error) {
      throw error;
    }

    return [];
  }

  private _mapSubscriptionsToRequest(
    subscriptions: Subscription[],
  ): Observable<AxiosResponse>[] {
    return _.chain(subscriptions)
      .reduce(this._reduceToUrlMap, new Map())
      .toPairs()
      .map(([url, subscriptionIds]) => this._toRequest(url, subscriptionIds))
      .value();
  }

  private _reduceToUrlMap(
    map: Map<string, string[]>,
    subscription: Subscription,
  ): Map<string, string[]> {
    if (!map.has(subscription.url)) {
      map.set(subscription.url, [subscription.id]);
    } else {
      map.set(subscription.url, [
        ...map.get(subscription.url),
        subscription.id,
      ]);
    }

    return map;
  }

  private _toRequest(
    url: string,
    subscriptionIds: string[],
  ): Observable<AxiosResponse> {
    return this.httpClient.post(url, subscriptionIds);
  }
}
