import { InputType, PickType } from '@nestjs/graphql';
import { CreateUserInput } from '../../user/dto/create-user.input';

@InputType()
export class SignInInput extends PickType(CreateUserInput, [
  'email',
  'password',
]) {}
