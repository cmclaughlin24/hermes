import { CreateCallNotificationDto } from '../dto/create-call-notification.dto';
import { CreateEmailNotificationDto } from '../dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../dto/create-phone-notification.dto';

export type NotificationDto =
  | CreateEmailNotificationDto
  | CreatePhoneNotificationDto
  | CreateCallNotificationDto;

export interface CreateNotificationDto {
  createNotificationDto(data: any): Promise<NotificationDto>;
}
