import { MissingException } from '@hermes/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import {
  MockHashingService,
  MockJwtService,
  MockUserService,
  createConfigServiceMock,
  createHashingServiceMock,
  createJwtServiceMock,
  createUserServiceMock,
} from '../../../test/helpers/provider.helper';
import { HashingService } from '../../common/services/hashing.service';
import { UserService } from '../user/user.service';
import { AuthenticationService } from './authentication.service';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';
import { ActiveUserData } from './entities/active-user.entity';
import { InvalidPasswordException } from './errors/invalid-password.exception';
import { InvalidTokenException } from './errors/invalid-token.exception';
import { TokenStorage } from './token.storage';

type MockTokenStorage = Partial<Record<keyof TokenStorage, jest.Mock>>;

const createTokenStorage = (): MockTokenStorage => ({
  insert: jest.fn(),
  validateRefresh: jest.fn(),
  validateJwt: jest.fn(),
  remove: jest.fn(),
});

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userService: MockUserService;
  let hashingService: MockHashingService;
  let jwtService: MockJwtService;
  let tokenStorage: MockTokenStorage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UserService,
          useValue: createUserServiceMock(),
        },
        {
          provide: HashingService,
          useValue: createHashingServiceMock(),
        },
        {
          provide: TokenStorage,
          useValue: createTokenStorage(),
        },
        {
          provide: JwtService,
          useValue: createJwtServiceMock(),
        },
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userService = module.get<MockUserService>(UserService);
    hashingService = module.get<MockHashingService>(HashingService);
    jwtService = module.get<MockJwtService>(JwtService);
    tokenStorage = module.get<MockTokenStorage>(TokenStorage);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp()', () => {
    const signUpInput: SignUpInput = {
      name: 'Falco Lombardi',
      email: 'falco.lombardi@nintendo.com',
      phoneNumber: '+19999999999',
      password: 'star-fox',
    };

    afterEach(() => {
      userService.create.mockClear();
    });

    it('should yield true if the sign up was successful', async () => {
      // Arrange.
      userService.create.mockResolvedValue({});

      // Act/Assert.
      await expect(service.signUp(signUpInput)).resolves.toBeTruthy();
    });

    it('should yield false otherwise', async () => {
      // Arrange.
      userService.create.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.signUp(signUpInput)).resolves.toBeFalsy();
    });
  });

  describe('signIn()', () => {
    const signInInput: SignInInput = {
      email: 'proto.man@sega.com',
      password: 'megaman',
    };

    afterEach(() => {
      userService.findByEmail.mockClear();
      hashingService.compare.mockClear();
      jwtService.signAsync.mockClear();
      tokenStorage.insert.mockClear();
    });

    it('should yield a tuple with the access and refresh tokens', async () => {
      // Arrange.
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NmUxMTAyNS0wMDMxLTQ0MjYtOTVlNC0yOTQ0YTY3MzRiZGUiLCJpYXQiOjE2OTk2NzEzNjUsImV4cCI6MTY5OTY3NDk2NSwiYXVkIjoibG9jYWxob3N0OjMwMDIiLCJpc3MiOiJsb2NhbGhvc3Q6MzAwMiJ9.TGElk96Qag9BcsJNYl-17Yjk4Xo4AxDY5DB5iKR4h_Q';
      userService.findByEmail.mockResolvedValue({ password: 'asdp897asdfa' });
      hashingService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(token);

      // Act/Assert.
      await expect(service.signIn(signInInput)).resolves.toEqual([
        token,
        token,
      ]);
    });

    it('should insert the refresh token id into storage', async () => {
      // Arrange.
      userService.findByEmail.mockResolvedValue({ password: '00pmk00832809k' });
      hashingService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('');

      // Act
      await service.signIn(signInInput);

      // Assert.
      expect(tokenStorage.insert).toHaveBeenCalled();
    });

    it('should throw a "MissingException" if the user does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `User with email=${signInInput.email} not found!`,
      );
      userService.findByEmail.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.signIn(signInInput)).rejects.toEqual(expectedResult);
    });

    it('should throw an "InvalidPasswordException" if the password is incorrect', async () => {
      // Arrange.
      userService.findByEmail.mockResolvedValue({ password: 'ao23lkj12j' });
      hashingService.compare.mockResolvedValue(false);

      // Act/Assert.
      await expect(service.signIn(signInInput)).rejects.toBeInstanceOf(
        InvalidPasswordException,
      );
    });
  });

  describe('verifyToken()', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZDU2Yjg4MC1lODBjLTQzZDMtYjk5MC00MmVlMGMxMDQ0MDQiLCJpYXQiOjE3MDAwNzU5NzUsImV4cCI6MTcwMDA3OTU3NSwiYXVkIjoibG9jYWxob3N0OjMwMDIiLCJpc3MiOiJsb2NhbGhvc3Q6MzAwMiJ9.lDB66KMBkrDV8T4xu3kXVBlF0yvWUsYVTCG1rfWH-uU';

    afterEach(() => {
      jwtService.verifyAsync.mockClear();
      tokenStorage.validateJwt.mockClear();
    });

    it('should yield an "ActiveUserData" object if the token is valid', async () => {
      // Arrange.
      const expectedResult: ActiveUserData = {
        name: 'Slippy Toad',
        sub: randomUUID(),
        authorization_details: [],
        jti: randomUUID(),
      };
      jwtService.verifyAsync.mockResolvedValue(expectedResult);
      tokenStorage.validateJwt.mockResolvedValue(true);

      // Act/Assert.
      await expect(service.verifyToken(token)).resolves.toEqual(expectedResult);
    });

    it('should throw an "InvalidTokenException" if the token is invalid (token)', async () => {
      // Arrange.
      jwtService.verifyAsync.mockRejectedValue(new Error());

      // Act/Assert.
      await expect(service.verifyToken(token)).rejects.toBeInstanceOf(
        InvalidTokenException,
      );
    });

    it('should throw an "InvalidTokenException" if the token is invalid (jti)', async () => {
      // Arrange.
      const expectedResult: ActiveUserData = {
        name: 'Peppy Hare',
        sub: randomUUID(),
        authorization_details: [],
        jti: randomUUID(),
      };
      jwtService.verifyAsync.mockResolvedValue(expectedResult);
      tokenStorage.validateJwt.mockResolvedValue(false);

      // Act/Assert.
      await expect(service.verifyToken(token)).rejects.toBeInstanceOf(
        InvalidTokenException,
      );
    });
  });

  describe('refreshToken()', () => {
    const userId = randomUUID();
    const refreshTokenId = randomUUID();
    const refreshToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NmUxMTAyNS0wMDMxLTQ0MjYtOTVlNC0yOTQ0YTY3MzRiZGUiLCJyZWZyZXNoVG9rZW5JZCI6IjQ2M2I1NjI5LTExOTUtNDk4YS1iZTk4LTY0M2NjMGU1MjA0NiIsImlhdCI6MTY5OTk3ODQzNiwiZXhwIjoxNzAwMDY0ODM2LCJhdWQiOiJsb2NhbGhvc3Q6MzAwMiIsImlzcyI6ImxvY2FsaG9zdDozMDAyIn0.TZ4bP0GDB2EzEQDG31rG6TaY7nChija4JZBUF3jwU88';

    afterEach(() => {
      jwtService.verifyAsync.mockClear();
      userService.findById.mockClear();
      tokenStorage.validateRefresh.mockClear();
      tokenStorage.remove.mockClear();
    });

    it('should yield a tuple with the access and refresh tokens if the token is valid', async () => {
      // Arrange.
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NmUxMTAyNS0wMDMxLTQ0MjYtOTVlNC0yOTQ0YTY3MzRiZGUiLCJpYXQiOjE2OTk2NzEzNjUsImV4cCI6MTY5OTY3NDk2NSwiYXVkIjoibG9jYWxob3N0OjMwMDIiLCJpc3MiOiJsb2NhbGhvc3Q6MzAwMiJ9.TGElk96Qag9BcsJNYl-17Yjk4Xo4AxDY5DB5iKR4h_Q';
      jwtService.verifyAsync.mockResolvedValue({
        sub: userId,
        refreshTokenId,
      });
      userService.findById.mockResolvedValue({ id: userId });
      tokenStorage.validateRefresh.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(token);

      // Act/Assert.
      await expect(service.refreshToken(refreshToken)).resolves.toEqual([
        token,
        token,
      ]);
    });

    it('should invalidate the refresh token from storage after it has been redeemed', async () => {
      // Arrange.
      jwtService.verifyAsync.mockResolvedValue({
        sub: userId,
        refreshTokenId,
      });
      userService.findById.mockResolvedValue({ id: userId });
      tokenStorage.validateRefresh.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('');

      // Act.
      await service.refreshToken(refreshToken);

      // Assert.
      expect(tokenStorage.remove).toHaveBeenCalledWith(userId);
    });

    it('should invalidate the refresh token from storage if an attempt to redeem an old token is made', async () => {
      // Arrange.
      jwtService.verifyAsync.mockResolvedValue({
        sub: userId,
        refreshTokenId,
      });
      userService.findById.mockResolvedValue({ id: userId });
      tokenStorage.validateRefresh.mockResolvedValue(false);

      // Act.
      await service.refreshToken(refreshToken).catch(() => {});

      // Assert.
      expect(tokenStorage.remove).toHaveBeenCalledWith(userId);
    });

    it('should throw an "InvalidTokenException" if the token is invalid', async () => {
      // Arrange.
      jwtService.verifyAsync.mockRejectedValue(new Error());

      // Act/Assert.
      await expect(service.refreshToken(refreshToken)).rejects.toBeInstanceOf(
        InvalidTokenException,
      );
    });

    it('should throw an "InvalidTokenException" if the token as been redeemed previously', async () => {
      // Arrange.
      jwtService.verifyAsync.mockResolvedValue({
        sub: userId,
        refreshTokenId,
      });
      userService.findById.mockResolvedValue({ id: userId });
      tokenStorage.validateRefresh.mockResolvedValue(false);

      // Act/Assert.
      await expect(service.refreshToken(refreshToken)).rejects.toBeInstanceOf(
        InvalidTokenException,
      );
    });
  });
});
