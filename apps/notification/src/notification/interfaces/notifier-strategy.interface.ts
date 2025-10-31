import { NotificationDto } from './notification-dto.interface';

export interface NotifierStrategy<T extends NotificationDto> {
  createNotificationDto(data: any): Promise<T>;
  createTemplate(dto: T): Promise<T>;
  notify(dto: T): Promise<any>;
}

