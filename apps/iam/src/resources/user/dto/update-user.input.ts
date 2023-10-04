import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';

@InputType()
export class UpdateUserInput extends OmitType(PartialType(CreateUserInput), [
  'password',
]) {}
