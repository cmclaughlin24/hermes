import { CreateEmailNotificationDto } from '../dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../dto/create-phone-notification.dto';

export type NotificationDto =
  | CreateEmailNotificationDto
  | CreatePhoneNotificationDto;

export interface CreateNotificationDto {
  createNotificationDto(data: any): Promise<NotificationDto>;
}
