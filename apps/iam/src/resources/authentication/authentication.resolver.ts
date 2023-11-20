import { errorToGraphQLException } from '@hermes/common';
import { Auth, AuthType } from '@hermes/iam';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { AuthenticationService } from './authentication.service';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';
import { ActiveUser } from './entities/active-user.entity';
import { Tokens } from './entities/tokens.entity';
import { InvalidPasswordException } from './errors/invalid-password.exception';
import { InvalidTokenException } from './errors/invalid-token.exception';

@Resolver()
export class AuthenticationResolver {
  private static readonly UNAUTHENTICATED_ERROR_CODE = 'UNAUTHENTICATED';

  constructor(private readonly authenticationService: AuthenticationService) {}

  @Mutation(() => Boolean, { name: 'signUp' })
  @Auth(AuthType.NONE)
  async signUp(@Args('signUpInput') signUpInput: SignUpInput) {
    return this.authenticationService.signUp(signUpInput).catch((error) => {
      throw errorToGraphQLException(error);
    });
  }

  @Mutation(() => Tokens, { name: 'signIn' })
  @Auth(AuthType.NONE)
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

  @Mutation(() => ActiveUser, { name: 'verifyAccessToken' })
  async verifyToken(@Args('token') token: string) {
    return this.authenticationService.verifyToken(token).catch((error) => {
      if (error instanceof InvalidTokenException) {
        throw new GraphQLError('Unauthorized: Invalid access token', {
          extensions: {
            code: AuthenticationResolver.UNAUTHENTICATED_ERROR_CODE,
          },
        });
      }
      throw errorToGraphQLException(error);
    });
  }

  @Mutation(() => Tokens, { name: 'refreshAccessToken' })
  async refreshToken(@Args('refreshToken') token: string) {
    try {
      const [accessToken, refreshToken] =
        await this.authenticationService.refreshToken(token);

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof InvalidTokenException) {
        throw new GraphQLError('Unauthorized: Invalid refresh token', {
          extensions: {
            code: AuthenticationResolver.UNAUTHENTICATED_ERROR_CODE,
          },
        });
      }
      throw errorToGraphQLException(error);
    }
  }
}
