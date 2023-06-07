import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

export class PushSubscriptionKeysDto {
  @ApiProperty({
    description:
      'Encryption key that the server should use to encrypt the message before ' +
      'sending it to the Push Service.',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  p256dh: string;

  @ApiProperty({
    description:
      'Authenication secret, which is one of the inputs of the message encryption',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  auth: string;
}

export class PushSubscriptionDto {
  @ApiProperty({
    description: 'Endpoint associated with the push subscription',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  endpoint: string;

  @ApiProperty({
    description: 'Expiration time associated with the push subscription',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  expirationTime?: EpochTimeStamp;

  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys: PushSubscriptionKeysDto;
}
