import { CreateEmailNotificationDto } from '../dto/create-email-notification.dto';
import { CreatePhoneNotificationDto } from '../dto/create-phone-notification.dto';
import { CreateRadioNotificationDto } from '../dto/create-radio-notification.dto';

export type NotificationDto =
  | CreateEmailNotificationDto
  | CreatePhoneNotificationDto
  | CreateRadioNotificationDto;

export interface CreateNotificationDto {
  createNotificationDto(data: any): Promise<NotificationDto>;
}
