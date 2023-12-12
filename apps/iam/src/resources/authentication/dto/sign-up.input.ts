import { InputType, PickType } from '@nestjs/graphql';
import { CreateUserInput } from '../../user/dto/create-user.input';

@InputType()
export class SignUpInput extends PickType(CreateUserInput, [
  'name',
  'email',
  'phoneNumber',
  'password',
]) {}
