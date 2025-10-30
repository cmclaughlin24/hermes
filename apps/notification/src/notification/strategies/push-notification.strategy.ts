import { DeliveryMethods, MissingException, Platform } from '@hermes/common';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnrecoverableError } from 'bullmq';
import { validateOrReject } from 'class-validator';
import Handlebars from 'handlebars';
import { catchError, firstValueFrom, map } from 'rxjs';
import * as webpush from 'web-push';
import { NotifierStrategy } from '../interfaces/notifier-strategy.interface';
import { PushTemplateService } from '../../push-template/push-template.service';
import { CreatePushNotificationDto } from '../../common/dto/create-push-notification.dto';

@Injectable()
export class PushNotificationStrategy
  implements NotifierStrategy<CreatePushNotificationDto>
{
  readonly type: DeliveryMethods = DeliveryMethods.PUSH;
  private readonly logger = new Logger(PushNotificationStrategy.name);
  private removeSubscriberUrl: string;
  private subscriberApiKeyHeader: string;
  private subscriberApiKey: string;

  constructor(
    private readonly pushTemplateService: PushTemplateService,
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    webpush.setVapidDetails(
      configService.get('VAPID_SUBJECT'),
      configService.get('VAPID_PUBLIC_KEY'),
      configService.get('VAPID_PRIVATE_KEY'),
    );
    this.removeSubscriberUrl = configService.get('REMOVE_SUBSCRIBER_URL');
    this.subscriberApiKeyHeader = configService.get(
      'SUBSCRIBER_API_KEY_HEADER',
    );
    this.subscriberApiKey = configService.get('SUBSCRIBER_API_KEY');
  }

  async notify(dto: CreatePushNotificationDto) {
    switch (dto.platform) {
      case Platform.WEB:
        return this._webPushNotification(dto);
      default:
        throw new UnrecoverableError(
          `Invalid Platform: ${dto.platform} is not an avaliable platform`,
        );
    }
  }

  async createNotificationDto(data: any) {
    if (!data) {
      throw new Error('Payload cannot be null/undefined');
    }

    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Payload must be an object');
    }

    const dto = new CreatePushNotificationDto();
    dto.subscriberId = data.subscriberId;
    dto.subscription = data.subscription;
    dto.notification = data.notification;
    dto.template = data.template;
    dto.platform = data.platform;
    dto.context = data.context;

    try {
      await validateOrReject(dto);
    } catch (errors) {
      const validationErrors = errors
        .map((error) => error.toString())
        .join(', ');
      throw new Error(validationErrors);
    }

    return dto;
  }

  async createTemplate(createPushNotificationDto: CreatePushNotificationDto) {
    const templateName = createPushNotificationDto.template;
    let notification = createPushNotificationDto.notification;

    if (templateName) {
      notification &&
        this.logger.warn(
          `[${this.createTemplate.name}] ${CreatePushNotificationDto.name} contains both 'notification' and 'template' keys, default to 'template' key`,
        );

      const pushTemplate = await this.pushTemplateService.findOne(templateName);

      if (!pushTemplate) {
        throw new MissingException(
          `Push Notification Template ${templateName} does not exist!`,
        );
      }

      notification = pushTemplate;
    }

    if (!notification) {
      throw new Error(
        `Invalid Argument: ${CreatePushNotificationDto.name} must have either 'notification' or 'template' keys present`,
      );
    }

    const titleTemplate = Handlebars.compile(notification.title);
    notification.title = titleTemplate({
      timeZone: createPushNotificationDto.timeZone,
      ...createPushNotificationDto.context,
    });

    if (notification.body) {
      const bodyTemplate = Handlebars.compile(notification.body);
      notification.body = bodyTemplate({
        timeZone: createPushNotificationDto.timeZone,
        ...createPushNotificationDto.context,
      });
    }

    // Note: Nullish keys removed from the notification object so that Angular and other frameworks
    //       with out the box service worker offerings do not attempt to convert properties.
    for (const key in notification) {
      !notification[key] && delete notification[key];
    }

    createPushNotificationDto.notification = notification;

    return createPushNotificationDto;
  }

  private async _webPushNotification({
    subscriberId,
    subscription,
    notification,
  }: CreatePushNotificationDto) {
    let response;

    try {
      response = await webpush.sendNotification(
        subscription,
        JSON.stringify({ notification }),
      );
    } catch (error) {
      if (error.statusCode === HttpStatus.GONE) {
        return this._removeSubscriber(subscriberId);
      }
      throw error;
    }

    return response;
  }

  private _removeSubscriber(subscriberId: string) {
    const request = this.httpService
      .delete(`${this.removeSubscriberUrl}/${subscriberId}`, {
        headers: { [this.subscriberApiKeyHeader]: this.subscriberApiKey },
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          throw error;
        }),
      );

    return firstValueFrom(request);
  }
}
