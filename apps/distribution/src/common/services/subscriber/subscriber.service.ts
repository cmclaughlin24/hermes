import { PushSubscriptionDto, PushSubscriptionKeysDto } from '@hermes/common';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { validateOrReject } from 'class-validator';
import * as _ from 'lodash';
import {
  Observable,
  catchError,
  firstValueFrom,
  forkJoin,
  map,
  throwError,
} from 'rxjs';
import { Subscription } from '../../../resources/subscription/entities/subscription.entity';
import { DeviceSubscriberDto } from '../../dto/device-subscriber.dto';
import { RequestSubscriberDto } from '../../dto/request-subscriber.dto';
import { SubscriberDto } from '../../dto/subscriber.dto';
import { UserSubscriberDto } from '../../dto/user-subscriber.dto';
import {
  SubscriptionData,
  SubscriptionType,
} from '../../types/subscription-type.type';

@Injectable()
export class SubscriberService {
  private readonly logger = new Logger(SubscriberService.name);
  private readonly subscribersRequestUrl = this.configService.get(
    'SUBSCRIBERS_REQUEST_URL',
  );
  private readonly subscriberApiKeyHeader = this.configService.get(
    'SUBSCRIBERS_API_KEY_HEADER',
  );
  private readonly subscriberApiKey = this.configService.get(
    'SUBSCRIBERS_API_KEY',
  );

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async get(subscriptions: Subscription[]): Promise<SubscriberDto[]> {
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
        map.get(SubscriptionType.REQUEST) as RequestSubscriberDto[],
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
        dto = this._createUserSubscriberDto(subscription.data);
        break;
      case SubscriptionType.DEVICE:
        dto = this._createDeviceSubscriberDto(
          subscription.subscriberId,
          subscription.data,
        );
        break;
      case SubscriptionType.REQUEST:
        dto = this._createRequestSubscriberDto(subscription.subscriberId);
        break;
      default:
        throw new Error(
          `Invalid Subscription Type: ${subscription.subscriptionType} not recognized`,
        );
    }

    await this._validateDto(dto);

    return dto;
  }

  mapToUserSubscriberDtos(data: any[]): UserSubscriberDto[] {
    if (_.isEmpty(data)) {
      return null;
    }

    return data
      .map((item) => this._createUserSubscriberDto(item))
      .filter(async (dto) => {
        try {
          await this._validateDto(dto);
        } catch (error) {
          this.logger.error(
            `${UserSubscriberDto.name} corrupted: error=${
              error.message
            } dto=${JSON.stringify(dto)}`,
          );
          return false;
        }
        return true;
      });
  }

  private _createUserSubscriberDto(data: any): UserSubscriberDto {
    const dto = new UserSubscriberDto();
    dto.deliveryMethods = data.deliveryMethods;
    dto.email = data.email;
    dto.phoneNumber = data.phoneNumber;
    dto.timeZone = data.timeZone;
    dto.deliveryWindows = data.deliveryWindows;
    return dto;
  }

  private _createDeviceSubscriberDto(
    subscriberId: string,
    data: any,
  ): DeviceSubscriberDto {
    const dto = new DeviceSubscriberDto();
    dto.subscriberId = subscriberId;
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

  private _createRequestSubscriberDto(
    subscriberId: string,
  ): RequestSubscriberDto {
    const dto = new RequestSubscriberDto();
    dto.url = this.subscribersRequestUrl;
    dto.id = subscriberId;
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
    requestSubscriberDtos: RequestSubscriberDto[],
  ): Promise<UserSubscriberDto[]> {
    const requests = _.chain(requestSubscriberDtos)
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
    data: RequestSubscriberDto,
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
  ): Observable<UserSubscriberDto[]> {
    const headers = {};

    if (this.subscriberApiKeyHeader && this.subscriberApiKey) {
      headers[this.subscriberApiKeyHeader] = this.subscriberApiKey;
    }

    return this.httpService
      .post(
        url,
        {
          query: `{
          users(userIds: ${JSON.stringify(ids)}) {
            email
            phoneNumber
            deliveryMethods
            timeZone
          }
        }`,
        },
        { headers },
      )
      .pipe(
        map(({ data: payload }) => {
          if (!_.isEmpty(payload.errors)) {
            throw new Error(JSON.stringify(payload.errors));
          }
          return this.mapToUserSubscriberDtos(payload.data?.users);
        }),
        // ? If supporting multiple request endpoints, should an error be thrown on attempts 1 to n-1
        //   so the message will be retried? Then on attempt n, process successful requests so some
        //   notifications are delivered?
        catchError((error: AxiosError | Error) => {
          this.logger.error(
            `Request for subscription data from ${url} failed: ${error.message}`,
          );
          return throwError(() => error);
        }),
      );
  }
}
