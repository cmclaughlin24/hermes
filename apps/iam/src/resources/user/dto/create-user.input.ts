import { InputType } from '@nestjs/graphql';
import { IsEmail, IsPhoneNumber, IsStrongPassword } from 'class-validator';

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
}
