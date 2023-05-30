import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as _ from 'lodash';
import { Observable, map } from 'rxjs';
import { Subscription } from '../../../resources/subscription/entities/subscription.entity';
import { SubscriptionMemberDto } from '../../dto/subscription-member.dto';

@Injectable()
export class SubscriptionMemberService {
  private readonly logger = new Logger(SubscriptionMemberService.name);

  constructor(private readonly httpClient: HttpService) {}

  async get(subscriptions: Subscription[]): Promise<SubscriptionMemberDto[]> {
    const requests = this._mapSubscriptionsToRequest(subscriptions);

    // try {
    //   await firstValueFrom(forkJoin(requests));
    // } catch (error) {
    //   throw error;
    // }

    return [];
  }

  map(members: any[]): SubscriptionMemberDto[] {
    if (_.isEmpty(members)) {
      return [];
    }

    return members.map((member) => {
      const dto = new SubscriptionMemberDto();
      dto.deliveryMethods = member.deliveryMethods;
      dto.email = member.email;
      dto.phoneNumber = member.phoneNumber;
      dto.timeZone = member.timeZone;
      dto.deliveryWindows = member.deliveryWindows;
      return dto;
    });
  }

  private _mapSubscriptionsToRequest(
    subscriptions: Subscription[],
  ): Observable<SubscriptionMemberDto[]>[] {
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
  ): Observable<SubscriptionMemberDto[]> {
    return this.httpClient
      .post(url, subscriptionIds)
      .pipe(map((response) => this.map(response.data)));
  }
}
