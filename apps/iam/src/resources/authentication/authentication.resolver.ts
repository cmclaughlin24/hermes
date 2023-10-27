import { errorToGraphQLException } from '@hermes/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { User } from '../user/entities/user.entity';
import { AuthenticationService } from './authentication.service';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';
import { Tokens } from './entities/tokens.entity';
import { InvalidPasswordException } from './errors/invalid-password.exception';

@Resolver()
export class AuthenticationResolver {
  private static readonly UNAUTHENTICATED_ERROR_CODE = 'UNAUTHENTICATED';

  constructor(private readonly authenticationService: AuthenticationService) {}

  @Mutation(() => User, { name: 'signUp' })
  async signUp(@Args('signUpInput') signUpInput: SignUpInput) {
    return this.authenticationService.signUp(signUpInput).catch((error) => {
      throw errorToGraphQLException(error);
    });
  }

  @Mutation(() => Tokens, { name: 'signIn' })
  async signIn(@Args('signInInput') signInInput: SignInInput) {
    try {
      const [accessToken, refreshToken] =
        await this.authenticationService.signIn(signInInput);

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof InvalidPasswordException) {
        throw new GraphQLError('Unauthorized: Invalid password', {
          extensions: {
            code: AuthenticationResolver.UNAUTHENTICATED_ERROR_CODE,
          },
        });
      }
      throw errorToGraphQLException(error);
    }
  }

  @Mutation(() => Boolean, { name: 'verifyAccessToken' })
  async verifyToken(@Args('token') token: string) {
    return this.authenticationService.verifyToken(token).catch((error) => {
      throw errorToGraphQLException(error);
    });
  }
}
