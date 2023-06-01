import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateOrReject } from 'class-validator';
import * as webpush from 'web-push';
import { CreatePushNotificationDto } from '../../dto/create-push-notification.dto';
import { CreateNotificationDto } from '../../interfaces/create-notification-dto.interface';

@Injectable()
export class PushNotificationService implements CreateNotificationDto {
  constructor(configService: ConfigService) {
    // Todo: Remove hardcoded subject and add validation to Joi schema.
    webpush.setVapidDetails(
      'mailto:curtismclauglhin24@gmail.com',
      configService.get('VAPID_PUBLIC_KEY'),
      configService.get('VAPID_PRIVATE_KEY'),
    );
  }

  async sendPushNotification(
    createPushNotificationDto: CreatePushNotificationDto,
  ) {}

  async createNotificationDto(data: any) {
    if (!data) {
      throw new Error('Payload cannot be null/undefined');
    }

    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Payload must be an object');
    }

    const createPushNotificationDto = new CreatePushNotificationDto();

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
}
