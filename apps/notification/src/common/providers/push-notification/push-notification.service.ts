import {
  Platform,
  PushNotificationDto,
  PushSubscriptionDto,
} from '@hermes/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnrecoverableError } from 'bullmq';
import { validateOrReject } from 'class-validator';
import Handlebars from 'handlebars';
import * as webpush from 'web-push';
import { PushTemplateService } from '../../../resources/push-template/push-template.service';
import { CreatePushNotificationDto } from '../../dto/create-push-notification.dto';
import { CreateNotificationDto } from '../../interfaces/create-notification-dto.interface';

@Injectable()
export class PushNotificationService implements CreateNotificationDto {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    private readonly pushTemplateService: PushTemplateService,
    configService: ConfigService,
  ) {
    webpush.setVapidDetails(
      configService.get('VAPID_SUBJECT'),
      configService.get('VAPID_PUBLIC_KEY'),
      configService.get('VAPID_PRIVATE_KEY'),
    );
  }

  async sendPushNotification(
    createPushNotificationDto: CreatePushNotificationDto,
  ) {
    switch (createPushNotificationDto.platform) {
      case Platform.WEB:
        return this._webPushNotification(
          createPushNotificationDto.subscription,
          createPushNotificationDto.notification,
        );
      default:
        throw new UnrecoverableError(
          `Invalid Platform: ${createPushNotificationDto.platform} is not an avaliable platform`,
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

    const createPushNotificationDto = new CreatePushNotificationDto();
    createPushNotificationDto.subscription = data.subscription;
    createPushNotificationDto.notification = data.notification;
    createPushNotificationDto.template = data.template;
    createPushNotificationDto.platform = data.platform;
    createPushNotificationDto.context = data.context;

    try {
      await validateOrReject(createPushNotificationDto);
    } catch (errors) {
      const validationErrors = errors
        .map((error) => error.toString())
        .join(', ');
      throw new Error(validationErrors);
    }

    return createPushNotificationDto;
  }

  async createPushNotificationTemplate(
    createPushNotificationDto: CreatePushNotificationDto,
  ) {
    const templateName = createPushNotificationDto.template;
    let notification = createPushNotificationDto.notification;

    if (templateName) {
      notification &&
        this.logger.warn(
          `[${this.createPushNotificationTemplate.name}] ${CreatePushNotificationDto.name} contains both 'notification' and 'template' keys, default to 'template' key`,
        );

      const pushTemplate = await this.pushTemplateService.findOne(templateName);

      notification = pushTemplate.toJSON();
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

  private async _webPushNotification(
    subscription: PushSubscriptionDto,
    notification: PushNotificationDto,
  ) {
    let response;

    try {
      // Fixme: Check response status code === 410 and remove subscriptions if true.
      response = await webpush.sendNotification(
        subscription,
        JSON.stringify({ notification }),
      );
    } catch (error) {
      console.error(error);
    }

    return response;
  }
}
