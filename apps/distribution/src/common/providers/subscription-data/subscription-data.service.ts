import { PushSubscriptionDto, PushSubscriptionKeysDto } from '@hermes/common';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { validateOrReject } from 'class-validator';
import * as _ from 'lodash';
import {
  Observable,
  catchError,
  firstValueFrom,
  forkJoin,
  map,
  of,
} from 'rxjs';
import { URLSearchParams } from 'url';
import { Subscription } from '../../../resources/subscription/entities/subscription.entity';
import { DeviceSubscriptionDto } from '../../dto/device-subscription.dto';
import { RequestSubscriptionDto } from '../../dto/request-subscription.dto';
import { SubscriptionDataDto } from '../../dto/subscription-data.dto';
import { UserSubscriptionDto } from '../../dto/user-subscription.dto';
import {
  SubscriptionData,
  SubscriptionType,
} from '../../types/subscription-type.type';

@Injectable()
export class SubscriptionDataService {
  private readonly logger = new Logger(SubscriptionDataService.name);

  constructor(private readonly httpService: HttpService) {}

  async get(subscriptions: Subscription[]): Promise<SubscriptionDataDto[]> {
    const map = new Map<SubscriptionType, SubscriptionData[]>();

    for (const subscription of subscriptions) {
      try {
        const dto = await this.createDto(subscription);
        const data = map.has(subscription.subscriptionType)
          ? map.get(subscription.subscriptionType)
          : [];

        data.push(dto);
        map.set(subscription.subscriptionType, data);
      } catch (error) {
        this.logger.error(
          `Subscription id=${subscription.id} corrupted: ${error.message}`,
        );
        continue;
      }
    }

    if (map.has(SubscriptionType.REQUEST)) {
      const requestData = await this._request(
        map.get(SubscriptionType.REQUEST) as RequestSubscriptionDto[],
      );

      // Todo: Refactor nested if-condition if possible.
      if (!_.isEmpty(requestData)) {
        const userData = map.has(SubscriptionType.USER)
          ? [...map.get(SubscriptionType.USER), ...requestData]
          : requestData;

        map.set(SubscriptionType.USER, userData);
      }

      map.delete(SubscriptionType.REQUEST);
    }

    return _.chain(map)
      .toPairs()
      .map(([key, values]) => values)
      .flatten()
      .value();
  }

  async createDto(subscription: Subscription): Promise<SubscriptionData> {
    let dto: SubscriptionData;

    switch (subscription.subscriptionType) {
      case SubscriptionType.USER:
        dto = this._createUserSubscriptionDto(subscription.data);
        break;
      case SubscriptionType.DEVICE:
        dto = this._createDeviceSubscriptionDto(subscription.data);
        break;
      case SubscriptionType.REQUEST:
        dto = this._createRequestSubscriptionDto(
          subscription.externalId,
          subscription.data,
        );
        break;
      default:
        throw new Error(
          `Invalid Subscription Type: ${subscription.subscriptionType} not recognized`,
        );
    }

    await this._validateDto(dto);

    return dto;
  }

  mapToUserSubscriptionDtos(data: any[]): UserSubscriptionDto[] {
    if (_.isEmpty(data)) {
      return null;
    }

    return data
      .map((item) => this._createUserSubscriptionDto(item))
      .filter(async (dto) => {
        try {
          await this._validateDto(dto);
        } catch (error) {
          this.logger.error(
            `${UserSubscriptionDto.name} corrupted: ${error.message}`,
          );
          return false;
        }
        return true;
      });
  }

  private _createUserSubscriptionDto(data: any): UserSubscriptionDto {
    const dto = new UserSubscriptionDto();
    dto.deliveryMethods = data.deliveryMethods;
    dto.email = data.email;
    dto.phoneNumber = data.phoneNumber;
    dto.timeZone = data.timeZone;
    dto.deliveryWindows = data.deliveryWindows;
    return dto;
  }

  private _createDeviceSubscriptionDto(data: any): DeviceSubscriptionDto {
    const dto = new DeviceSubscriptionDto();
    dto.platform = data.platform;
    dto.timeZone = data.timeZone;
    dto.subscription = this._createPushSubscriptonDto(data.subscription);
    return dto;
  }

  private _createPushSubscriptonDto(subscription: any): PushSubscriptionDto {
    const dto = new PushSubscriptionDto();
    dto.endpoint = subscription.endpoint;
    dto.expirationTime = subscription.expirationTime;
    dto.keys = new PushSubscriptionKeysDto();
    dto.keys.auth = subscription.keys?.auth;
    dto.keys.p256dh = subscription.keys?.p256dh;
    return dto;
  }

  private _createRequestSubscriptionDto(
    externalId: string,
    data: any,
  ): RequestSubscriptionDto {
    const dto = new RequestSubscriptionDto();
    dto.url = data.url;
    dto.id = externalId;
    return dto;
  }

  private async _validateDto(dto: object) {
    try {
      await validateOrReject(dto);
    } catch (errors) {
      const validationErrors = errors
        .map((error) => error.toString())
        .join(', ');
      throw new Error(validationErrors);
    }
  }

  private _request(
    requestSubscriptionDtos: RequestSubscriptionDto[],
  ): Promise<UserSubscriptionDto[]> {
    const requests = _.chain(requestSubscriptionDtos)
      .reduce(this._reduceToUrlMap, new Map())
      .toPairs()
      .map(([url, ids]) => this._toRequest(url, ids))
      .value();

    return firstValueFrom(forkJoin(requests)).then((result) =>
      _.flatten(result),
    );
  }

  private _reduceToUrlMap(
    map: Map<string, string[]>,
    data: RequestSubscriptionDto,
  ): Map<string, string[]> {
    if (!map.has(data.url)) {
      map.set(data.url, [data.id]);
    } else {
      map.set(data.url, [...map.get(data.url), data.id]);
    }

    return map;
  }

  private _toRequest(
    url: string,
    ids: string[],
  ): Observable<UserSubscriptionDto[]> {
    const params = new URLSearchParams();
    ids.forEach((id) => params.append('id', id));

    return this.httpService.get(`${url}?${params.toString()}`).pipe(
      map((response) => this.mapToUserSubscriptionDtos(response.data)),
      // Fixme: Should an error be thrown on attempts 1-(n-1) so the message will be retried?
      catchError((error: AxiosError) => {
        this.logger.error(
          `Request for subscription data from ${url} failed: ${error.message}`,
        );
        return of([]);
      }),
    );
  }
}
