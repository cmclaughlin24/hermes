import { ApolloServerErrorCode } from '@apollo/server/errors';
import { ExistsException } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { GraphQLError } from 'graphql';
import { ActiveEntityData } from '../../common/entities/active-entity.entity';
import { GraphQLErrorCode } from '../../common/types/graphql-error-code.type';
import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationService } from './authentication.service';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';
import { InvalidPasswordException } from './errors/invalid-password.exception';
import { InvalidTokenException } from './errors/invalid-token.exception';

type MockAuthenticationService = Partial<
  Record<keyof AuthenticationService, jest.Mock>
>;

const createAuthenticationServiceMock = (): MockAuthenticationService => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  verifyToken: jest.fn(),
  refreshToken: jest.fn(),
});

describe('AuthenticationResolver', () => {
  let resolver: AuthenticationResolver;
  let service: MockAuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationResolver,
        {
          provide: AuthenticationService,
          useValue: createAuthenticationServiceMock(),
        },
      ],
    }).compile();

    resolver = module.get<AuthenticationResolver>(AuthenticationResolver);
    service = module.get<MockAuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('signUp()', () => {
    const signUpInput: SignUpInput = {
      name: 'Ori',
      email: 'ori@moon-studios.com',
      phoneNumber: '+19999999999',
      password: 'the-blind-forest',
    };

    afterEach(() => {
      service.signUp.mockClear();
    });

    it('should yield true if the sign up was successful', async () => {
      // Arrange.
      service.signUp.mockResolvedValue(true);

      // Act/Assert.
      await expect(resolver.signUp(signUpInput)).resolves.toBeTruthy();
    });

    it('should yield false otherwise', async () => {
      // Arrange.
      service.signUp.mockResolvedValue(false);

      // Act/Assert.
      await expect(resolver.signUp(signUpInput)).resolves.toBeFalsy();
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if the email or phone number is already in use', async () => {
      // Arrange.
      const errorMessage = `User with email=${signUpInput.email} or phoneNumber=${signUpInput.phoneNumber} already exists!`;
      const expectedResult = new GraphQLError(errorMessage, {
        extensions: {
          code: ApolloServerErrorCode.BAD_USER_INPUT,
        },
      });
      service.signUp.mockRejectedValue(new ExistsException(errorMessage));

      // Act/Assert.
      await expect(service.signUp(signUpInput)).rejects.toEqual(expectedResult);
    });
  });

  describe('signIn()', () => {
    const signInInput: SignInInput = {
      email: 'ku@moon-studios.com',
      password: '+18888888888',
    };

    afterEach(() => {
      service.signIn.mockClear();
    });

    it('should yield a "Tokens" object if the sign in was successful', async () => {
      // Arrange.
      const accessToken = 'naru';
      const refreshToken = 'gumo';
      service.signIn.mockResolvedValue([accessToken, refreshToken]);

      // Act/Assert.
      await expect(resolver.signIn(signInInput)).resolves.toEqual({
        accessToken,
        refreshToken,
      });
    });

    it('a "GraphQLError" with a "UNAUTHENTICATED" code if the sign in failed', async () => {
      // Arrange.
      const expectedResult = new GraphQLError(
        'Unauthorized: Invalid password',
        {
          extensions: {
            code: GraphQLErrorCode.UNAUTHENTICATED_ERROR_CODE,
          },
        },
      );
      service.signIn.mockRejectedValue(new InvalidPasswordException());

      // Act/Assert.
      await expect(resolver.signIn(signInInput)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if the email does not exist', async () => {
      // Arrange.
      const errorMessage = `User with email=${signInInput.email} not found!`;
      const expectedResult = new GraphQLError(errorMessage, {
        extensions: {
          code: ApolloServerErrorCode.BAD_USER_INPUT,
        },
      });
      service.signIn.mockRejectedValue(new ExistsException(errorMessage));

      // Act/Assert.
      await expect(resolver.signIn(signInInput)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('verifyToken()', () => {
    afterEach(() => {
      service.verifyToken.mockClear();
    });

    it('should yield an "ActiveEntityData" object if the token is valid', async () => {
      // Arrange.
      const expectedResult: ActiveEntityData = {
        name: 'Shriek',
        sub: randomUUID(),
        authorization_details: [],
      };
      service.verifyToken.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(resolver.verifyToken('')).resolves.toEqual(expectedResult);
    });

    it('a "GraphQLError" with a "UNAUTHENTICATED" code if the token is invalid', async () => {
      // Arrange.
      const expectedResult = new GraphQLError(
        'Unauthorized: Invalid access token',
        {
          extensions: {
            code: GraphQLErrorCode.UNAUTHENTICATED_ERROR_CODE,
          },
        },
      );
      service.verifyToken.mockRejectedValue(new InvalidTokenException());

      // Act/Assert.
      await expect(resolver.verifyToken('')).rejects.toEqual(expectedResult);
    });
  });

  describe('refreshToken()', () => {
    afterEach(() => {
      service.refreshToken.mockClear();
    });

    it('should yield a "Tokens" object if the token is valid', async () => {
      // Arrange.
      const accessToken = 'seir';
      const refreshToken = 'naru';
      service.refreshToken.mockResolvedValue([accessToken, refreshToken]);

      // Act/Assert.
      await expect(resolver.refreshToken('')).resolves.toEqual({
        accessToken,
        refreshToken,
      });
    });

    it('a "GraphQLError" with a "UNAUTHENTICATED" code if the token is invalid', async () => {
      // Arrange.
      const expectedResult = new GraphQLError(
        'Unauthorized: Invalid refresh token',
        {
          extensions: {
            code: GraphQLErrorCode.UNAUTHENTICATED_ERROR_CODE,
          },
        },
      );
      service.refreshToken.mockRejectedValue(new InvalidTokenException());

      // Act/Assert.
      await expect(resolver.refreshToken('')).rejects.toEqual(expectedResult);
    });
  });
});
