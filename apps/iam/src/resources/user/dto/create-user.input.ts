import { InputType } from '@nestjs/graphql';
import { IsEmail, IsPhoneNumber } from 'class-validator';

@InputType()
export class CreateUserInput {
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phoneNumber: string;
}
