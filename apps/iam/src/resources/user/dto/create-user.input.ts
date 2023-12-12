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
  ValidateNested,
} from 'class-validator';
import { CreatePermissionInput } from '../../permission/dto/create-permission.input';
import { DeliveryMethods } from '../enums/delivery-methods.enum';

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

  @IsEnum(DeliveryMethods, { each: true })
  @IsOptional()
  @Field(() => [DeliveryMethods], { nullable: true })
  deliveryMethods?: DeliveryMethods[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionInput)
  permissions?: CreatePermissionInput[];
}
