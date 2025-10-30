import { DeliveryMethods } from '@hermes/common';

export interface NotifierStrategy<T> {
  type: DeliveryMethods;
  createNotificationDto(data: any): Promise<T>;
  createTemplate(dto: T): Promise<T>;
  notify(dto: T): Promise<any>;
}
