import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { IAM_MODULE_OPTIONS_TOKEN } from '../iam.module-definition';
import { AuthType } from '../types/auth-type.type';
import { IamModuleOptions } from '../types/iam-module-options.type';
import { AccessTokenGuard } from './access-token.guard';
import { ApiKeyGuard } from './api-key.guard';
import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  let iamModuleOptions: IamModuleOptions;
  let reflector: any;
  let accessTokenGuard: any;
  let apiKeyGuard: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IAM_MODULE_OPTIONS_TOKEN,
          useValue: {},
        },
        {
          provide: Reflector,
          useValue: {},
        },
        {
          provide: AccessTokenGuard,
          useValue: {},
        },
        {
          provide: ApiKeyGuard,
          useValue: {},
        },
      ],
    }).compile();

    iamModuleOptions = module.get<IamModuleOptions>(IAM_MODULE_OPTIONS_TOKEN);
    reflector = module.get<any>(Reflector);
    accessTokenGuard = module.get<any>(AccessTokenGuard);
    apiKeyGuard = module.get<any>(ApiKeyGuard);
  });

  it('should be defined', () => {
    expect(
      new AuthenticationGuard(
        iamModuleOptions,
        reflector,
        accessTokenGuard,
        apiKeyGuard,
      ),
    ).toBeDefined();
  });

  describe('defaultAuthTypes()', () => {
    it('should yield the AuthTypes passed in "IamModuleOptions"', () => {
      // Arrange.
      const expectedResult: AuthType[] = [AuthType.API_KEY, AuthType.BEARER];
      const authenticationGuard = new AuthenticationGuard(
        { defaultAuthTypes: expectedResult },
        reflector,
        accessTokenGuard,
        apiKeyGuard,
      );

      // Act/Assert.
      // @ts-ignore
      expect(authenticationGuard.defaultAuthTypes).toEqual(expectedResult);
    });

    it('should yield the default AuthTypes otherwise', () => {
      // Arrange.
      const expectedResult: AuthType[] = [AuthType.API_KEY];
      const authenticationGuard = new AuthenticationGuard(
        {},
        reflector,
        accessTokenGuard,
        apiKeyGuard,
      );

      // Act/Assert.
      // @ts-ignore
      expect(authenticationGuard.defaultAuthTypes).toEqual(expectedResult);
    });
  });

  describe('canActivate()', () => {
    it.todo('should yield true if...');

    it.todo('should rethrow an exception thrown by a guard if...');

    it.todo('should throw an "UnauthorizedException" if...');
  });
});
