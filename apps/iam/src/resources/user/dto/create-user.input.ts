import { Field, InputType } from '@nestjs/graphql';
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
  @Field({
    description: 'Name of the user.',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value.trim())
  name: string;

  @Field({
    description:
      'Email address of the user. An email address is unique within ' +
      'the system and cannot be assigned to multiple user.',
  })
  @IsEmail()
  email: string;

  @Field({
    description:
      'Phone number of the user. A phone number is unique within ' +
      'the system and cannot be assigned to multiple users.',
  })
  @IsPhoneNumber()
  phoneNumber: string;

  @Field({
    description:
      "User's password to prove his/her identity. Must be a strong password " +
      'with a minimum length of 6 characters and an uppercase, lowercase, ' +
      'and special character.',
  })
  @IsStrongPassword({
    minLength: 6,
  })
  password: string;

  @Field({
    description:
      "User's preferred IANA time zone. Used to format notification date/timestamps " +
      "and send notifications within the user's delivery windows.",
  })
  @IsTimeZone()
  @IsOptional()
  timeZone?: string;

  @Field(() => [DeliveryMethods], {
    nullable: true,
    description:
      "An array of the user's preferred notification delivery methods.",
  })
  @IsEnum(DeliveryMethods, { each: true })
  @IsOptional()
  deliveryMethods?: DeliveryMethods[];

  @Field(() => [DeliveryWindowInput], {
    description:
      "An array of the user's preferred notification delivery windows. Used w/timeZone to " +
      "calculate if the notification event is within the window's time range.",
    nullable: true,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DeliveryWindowInput)
  deliveryWindows?: DeliveryWindowInput[];

  @Field(() => [CreatePermissionInput], {
    description:
      "An array of the user's permissions that determine whether a request is " +
      'allowed or denied.',
    nullable: true,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionInput)
  permissions?: CreatePermissionInput[];
}
