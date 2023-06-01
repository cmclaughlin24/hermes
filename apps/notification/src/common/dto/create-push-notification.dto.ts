import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsBase64,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

class PushSubscriptionOptionsDto {
  @IsString()
  @IsBase64()
  applicationServerKey: string;

  @IsBoolean()
  userVisibleOnly: boolean;
}

class PushSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  endpoint: string;

  @IsNumber()
  @IsOptional()
  expirationTime: EpochTimeStamp;

  @ValidateNested()
  @Type(() => PushSubscriptionOptionsDto)
  options: PushSubscriptionOptionsDto;
}

class PushNotificationActionDto {
  action: string;
  title: string;
}

class PushNotificationDto {
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

export class CreatePushNotificationDto {
  @ValidateNested()
  @Type(() => PushSubscriptionDto)
  subscription: PushSubscriptionDto;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => PushNotificationDto)
  notification?: PushNotificationDto;

  @ApiProperty({
    description: 'Name of push notification template',
    example: 'order-confirmation',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  template?: string;

  @ApiProperty({
    description: 'Values to be injected into the push notification template',
    example: {
      firstName: 'John',
      lastName: 'Doe',
      message: {
        type: 'push notification',
      },
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  context?: any;
}
