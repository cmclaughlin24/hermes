import { Test, TestingModule } from '@nestjs/testing';
import { IAM_MODULE_OPTIONS_TOKEN } from '../iam.module-definition';
import { IamModuleOptions } from '../types/iam-module-options.type';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  let iamModuleOptions: IamModuleOptions;

  const apiKey = 'unit-test';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IAM_MODULE_OPTIONS_TOKEN,
          useValue: { apiKeys: apiKey } as IamModuleOptions,
        },
      ],
    }).compile();

    iamModuleOptions = module.get<IamModuleOptions>(IAM_MODULE_OPTIONS_TOKEN);
  });

  describe('apiKeyHeader()', () => {
    it('should yield the api key header passed in the "IamModuleOptions"', () => {
      // Arrange.
      const expectedResult = 'unit-test';
      const apiKeyGuard = new ApiKeyGuard({ apiKeyHeader: expectedResult });

      // Act/Assert.
      // @ts-ignore
      expect(apiKeyGuard.apiKeyHeader).toBe(expectedResult);
    });

    it('should yield the default api key header otherwise', () => {
      // Arrange.
      const apiKeyGuard = new ApiKeyGuard({});

      // Act/Assert.
      // @ts-ignore
      expect(apiKeyGuard.apiKeyHeader).toBe(ApiKeyGuard.DEFAULT_API_KEY_HEADER);
    });
  });

  describe('apiKeys()', () => {
    it('should yield the list of api keys passed in the "IamModuleOptions"', () => {
      // Arrange.
      const apiKeys = 'unit-test,e2e-test';
      const apiKeyGuard = new ApiKeyGuard({ apiKeys });
      const expectedResult = apiKeys.split(',');

      // Act/Assert.
      // @ts-ignore
      expect(apiKeyGuard.apiKeys).toEqual(expectedResult);
    });

    it('should yield the list of default api keys otherwise', () => {
      // Arrange.
      const apiKeyGuard = new ApiKeyGuard({});

      // Act/Assert.
      // @ts-ignore
      expect(apiKeyGuard.apiKeys).toEqual([ApiKeyGuard.DEFAULT_API_KEY]);
    });
  });

  it('should be defined', () => {
    expect(new ApiKeyGuard(iamModuleOptions)).toBeDefined();
  });

  describe('canActivate()', () => {
    let apiKeyGuard: ApiKeyGuard;

    beforeEach(() => {
      apiKeyGuard = new ApiKeyGuard(iamModuleOptions);
    });

    afterEach(() => {
      apiKeyGuard = null;
    });

    it('should yield true if the api key is equivalent to one of the api keys', () => {
      // Arrange.
      const context: any = {
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

    it('should yield false otherwise', () => {
      // Arrange.
      const context: any = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn(() => ({ header: jest.fn(() => 'e2e-test') })),
        })),
      };

      // Act.
      const result = apiKeyGuard.canActivate(context);

      // Assert.
      expect(result).toBeFalsy();
    });
  });
});
