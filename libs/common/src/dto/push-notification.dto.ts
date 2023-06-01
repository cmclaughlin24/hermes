export class PushNotificationActionDto {
  action: string;
  title: string;
}

export class PushNotificationDto {
  actions?: PushNotificationActionDto[];
  badge?: string;
  body?: string;
  data?: any;
  dir?: any;
  icon?: string;
  image?: string;
  lang?: string;
  renotify?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: string;
  vibrate?: number[];
}
