import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreatePushNotificationDto {
  // Todo: Create separate validation class for the PushSubscription object.
  subscription: PushSubscription;

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
