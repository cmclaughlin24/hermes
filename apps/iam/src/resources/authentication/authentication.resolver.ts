import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '../users/entities/users.entity';
import { AuthenticationService } from './authentication.service';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';

@Resolver()
export class AuthenticationResolver {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Mutation(() => User, { name: 'signUp', nullable: true })
  async signUp(@Args('signUpInput') signUpInput: SignUpInput) {
    return this.authenticationService.signUp(signUpInput);
  }

  // Todo: Convert to returning an access and refresh token
  @Mutation(() => User, { name: 'signIn' })
  async signIn(@Args('signInInput') signInInput: SignInInput) {
    return this.authenticationService.signIn(signInInput);
  }
}
