import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  Allow,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsLocale,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { TextDirection } from '../types/text-direction.types';

export class PushNotificationActionDto {
  @ApiProperty({
    description:
      'Identifier for a user action to be displayed on the notification',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  action: string;

  @ApiProperty({
    description: 'Action text to be shown to the user',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;

  @ApiProperty({
    description: 'URL of the icon to be displayed with the action',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  icon?: string;
}

export class PushNotificationDto {
  @ValidateNested({ each: true })
  @Type(() => PushNotificationActionDto)
  actions?: PushNotificationActionDto[];

  @ApiProperty({
    description:
      'URL of the image used to represent the notification when there is not ' +
      'enough space to display the notification itself',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  badge?: string;

  @ApiProperty({
    description:
      'Body of the notification that can accept values from a nested JavaScript object. ' +
      'Date formatting supported through the "formatDate" Handlerbars helper.',
    example:
      "You successfully sent you're first {{notificationType}} notification!",
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  body?: string;

  @ApiProperty({
    description: 'Data of the notification',
    required: false,
  })
  @Allow()
  @IsOptional()
  data?: any;

  @ApiProperty({
    description: 'Text direction of the notification',
    required: false,
  })
  @IsEnum(TextDirection)
  @IsOptional()
  dir?: TextDirection;

  @ApiProperty({
    description: 'URL of an image to be used as the icon of the notification',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'URL of an image to displayed as part of the notification',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Language code of the notification',
    required: false,
  })
  @IsLocale()
  @IsOptional()
  lang?: string;

  @ApiProperty({
    description:
      'Indicates whether the user should be renotified after a new notification ' +
      'replaces the old one',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  renotify?: boolean;

  @ApiProperty({
    description:
      'Indicates whether the notification should remain active until the ' +
      'user clicks or dismisses it, rather than closing automatically',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  requireInteraction?: boolean;

  @ApiProperty({
    description:
      'Specifies whether the notification should be silent (i.e. no sounds or vibrations ' +
      'should be issued, regardless of device settings)',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  silent?: boolean;

  @ApiProperty({
    description: 'The ID of the notification (if any)',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  tag?: string;

  @ApiProperty({
    description:
      'Specifies the time at which the notification is applicable (past, present, or future)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @ApiProperty({
    description:
      'Title of the notification that can accept values from a nested JavaScript object. ' +
      'Date formatting supported through the "formatDate" Handlerbars helper.',
    example:
      '{{ title }} sent on {{ {{ formatDate receivedOn timeZone format }} }}',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;

  @ApiProperty({
    description:
      'Specifies a vibration pattern for devices with vibration hardware',
    required: false,
  })
  @IsNumber(null, { each: true })
  @IsOptional()
  vibrate?: number[];
}
