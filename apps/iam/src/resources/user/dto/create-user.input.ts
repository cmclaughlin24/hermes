import { InputType } from '@nestjs/graphql';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsTimeZone,
  ValidateNested,
} from 'class-validator';
import { CreatePermissionInput } from '../../permission/dto/create-permission.input';
import { DeliveryMethods } from '../enums/delivery-methods.enum';
import { DeliveryWindowInput } from './delivery-window.input';

@InputType()
export class CreateUserInput {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsStrongPassword({
    minLength: 6,
  })
  password: string;

  @IsTimeZone()
  @IsOptional()
  timeZone?: string;

  @IsEnum(DeliveryMethods, { each: true })
  @IsOptional()
  deliveryMethods?: DeliveryMethods[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DeliveryWindowInput)
  deliveryWindows?: DeliveryWindowInput[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionInput)
  permissions?: CreatePermissionInput[];
}
