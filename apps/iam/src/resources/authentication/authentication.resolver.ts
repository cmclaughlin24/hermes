import { errorToGraphQLException } from '@hermes/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '../user/entities/user.entity';
import { AuthenticationService } from './authentication.service';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';

@Resolver()
export class AuthenticationResolver {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Mutation(() => User, { name: 'signUp' })
  async signUp(@Args('signUpInput') signUpInput: SignUpInput) {
    return this.authenticationService.signUp(signUpInput).catch((error) => {
      throw errorToGraphQLException(error);
    });
  }

  @Mutation(() => User, { name: 'signIn' })
  async signIn(@Args('signInInput') signInInput: SignInInput) {}

  @Mutation(() => Boolean, { name: 'verifyAccessToken' })
  async verifyToken(@Args('token') token: string) {}
}
