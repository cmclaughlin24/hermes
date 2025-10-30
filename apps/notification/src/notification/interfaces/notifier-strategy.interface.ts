import { DeliveryMethods } from '@hermes/common';
import { NotificationDto } from './notification-dto.interface';

export interface NotifierStrategy<T extends NotificationDto> {
  type: DeliveryMethods;
  createNotificationDto(data: any): Promise<T>;
  createTemplate(dto: T): Promise<T>;
  notify(dto: T): Promise<any>;
}

