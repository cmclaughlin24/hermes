import { CreateEmailNotificationDto } from '../dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../dto/create-phone-notification.dto';
import { CreatePushNotificationDto } from '../dto/create-push-notification.dto';

export type NotificationDto =
  | CreateEmailNotificationDto
  | CreatePhoneNotificationDto
  | CreatePushNotificationDto;

export interface CreateNotificationDto {
  createNotificationDto(data: any): Promise<NotificationDto>;
}
