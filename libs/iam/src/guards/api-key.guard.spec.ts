import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAM_MODULE_OPTIONS_TOKEN } from '../iam.module-definition';
import { TokenService } from '../services/token.service';
import { IamModuleOptions } from '../types/iam-module-options.type';
import { ApiKeyGuard } from './api-key.guard';

type MockTokenService = Partial<Record<keyof TokenService, jest.Mock>>;

const createTokenServiceMock = (): MockTokenService => ({
  verifyApiKey: jest.fn(),
});

describe('ApiKeyGuard', () => {
  let iamModuleOptions: IamModuleOptions;
  let tokenService: MockTokenService;

  const apiKey = 'unit-test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IAM_MODULE_OPTIONS_TOKEN,
          useValue: { apiKeys: apiKey } as IamModuleOptions,
        },
        {
          provide: TokenService,
          useValue: createTokenServiceMock(),
        },
      ],
    }).compile();

    iamModuleOptions = module.get<IamModuleOptions>(IAM_MODULE_OPTIONS_TOKEN);
    tokenService = module.get<MockTokenService>(TokenService);
  });

  describe('apiKeyHeader()', () => {
    it('should yield the api key header passed in the "IamModuleOptions"', () => {
      // Arrange.
      const expectedResult = 'unit-test';
      const apiKeyGuard = new ApiKeyGuard(
        { apiKeyHeader: expectedResult },
        tokenService as any,
      );

      // Act/Assert.
      // @ts-ignore
      expect(apiKeyGuard.apiKeyHeader).toBe(expectedResult);
    });

    it('should yield the default api key header otherwise', () => {
      // Arrange.
      const apiKeyGuard = new ApiKeyGuard({}, tokenService as any);

      // Act/Assert.
      // @ts-ignore
      expect(apiKeyGuard.apiKeyHeader).toBe(ApiKeyGuard.DEFAULT_API_KEY_HEADER);
    });
  });

  it('should be defined', () => {
    expect(
      new ApiKeyGuard(iamModuleOptions, tokenService as any),
    ).toBeDefined();
  });

  describe('canActivate()', () => {
    let apiKeyGuard: ApiKeyGuard;

    beforeEach(() => {
      apiKeyGuard = new ApiKeyGuard(iamModuleOptions, tokenService as any);
    });

    afterEach(() => {
      apiKeyGuard = null;
      tokenService.verifyApiKey.mockClear();
    });

    it('should yield true if the api key is valid', () => {
      // Arrange.
      const context: any = {
        getType: jest.fn(() => 'http'),
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn(() => ({ header: jest.fn(() => apiKey) })),
        })),
      };

      // Act.
      const result = apiKeyGuard.canActivate(context);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should throw an "UnauthorizedException" if the api key header does not include an api key', async () => {
      // Arrange.
      const context: any = {
        getType: jest.fn(() => 'http'),
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn(() => ({ header: () => null })),
        })),
      };
      const expectedResult = new UnauthorizedException();

      // Act/Assert.
      await expect(apiKeyGuard.canActivate(context)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw an "UnauthorizedException" if the api key is invalid', async () => {
      // Arrange.
      const context: any = {
        getType: jest.fn(() => 'http'),
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn(() => ({
            header: () => 'metroid-prime-ii-echoes',
          })),
        })),
      };
      const expectedResult = new UnauthorizedException();
      tokenService.verifyApiKey.mockRejectedValue({});

      // Act/Assert.
      await expect(apiKeyGuard.canActivate(context)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
