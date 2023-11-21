import { InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsStrongPassword,
  ValidateNested,
} from 'class-validator';
import { CreatePermissionInput } from '../../permission/dto/create-permission.input';

@InputType()
export class CreateUserInput {
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsStrongPassword({
    minLength: 6,
  })
  password: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionInput)
  permissions?: CreatePermissionInput[];
}
