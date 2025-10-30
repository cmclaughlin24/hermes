import { CreateEmailNotificationDto } from '../../notification/dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../../notification/dto/create-phone-notification.dto';
import { CreatePushNotificationDto } from '../../notification/dto/create-push-notification.dto';

export type NotificationDto =
  | CreateEmailNotificationDto
  | CreatePhoneNotificationDto
  | CreatePushNotificationDto;

export interface CreateNotificationDto {
  createNotificationDto(data: any): Promise<NotificationDto>;
}
