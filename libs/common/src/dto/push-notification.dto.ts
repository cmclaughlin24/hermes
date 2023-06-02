import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;

  vibrate?: number[];
}
