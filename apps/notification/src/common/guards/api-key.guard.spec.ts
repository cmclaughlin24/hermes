import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createConfigServiceMock,
  MockConfigService
} from '../../../../notification/test/helpers/provider.helpers';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  let configService: any;
  let reflector: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: createConfigServiceMock(),
        },
      ],
    }).compile();

    reflector = module.get<any>(Reflector);
    configService = module.get<MockConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(new ApiKeyGuard(reflector, configService)).toBeDefined();
  });

  describe('canActivate()', () => {
    let apiKeyGuard: ApiKeyGuard;
    const apiKey = 'test';
    const context: any = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({ header: jest.fn(() => apiKey) })),
      })),
    };

    beforeEach(() => {
      apiKeyGuard = new ApiKeyGuard(reflector, configService);
    });

    afterEach(() => {
      apiKeyGuard = null;
      reflector.get.mockClear();
    });

    it('should yield true if the context metadata includes the "IS_PUBLIC_KEY"', () => {
      // Arrange.
      reflector.get.mockReturnValue(true);

      // Act.
      const result = apiKeyGuard.canActivate(context);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if the api key is equivalent to the environment api key', () => {
      // Arrange.
      reflector.get.mockReturnValue(false);
      configService.get.mockReturnValue(apiKey);

      // Act.
      const result = apiKeyGuard.canActivate(context);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield false otherwise', () => {
      // Arrange.
      reflector.get.mockReturnValue(false);
      configService.get.mockReturnValue('invalid')

      // Act.
      const result = apiKeyGuard.canActivate(context);

      // Assert.
      expect(result).toBeFalsy();
    });
  });
});
