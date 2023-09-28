import { InputType } from '@nestjs/graphql';
import { CreateUserInput } from '../../users/dto/create-user.input';

@InputType()
export class SignUpInput implements CreateUserInput {
  email: string;
  password: string;
}
