import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { IAM_MODULE_OPTIONS_TOKEN } from '../iam.module-definition';
import { ActiveEntityData } from '../types/active-entity-data.type';
import { IamModuleOptions } from '../types/iam-module-options.type';
import { IamPermissionOptions } from '../types/iam-permission-options.type';
import { AuthorizationGuard } from './authorization.guard';

type MockReflector = Partial<Record<keyof Reflector, jest.Mock>>;

const createReflectorMock = (): MockReflector => ({
  getAllAndOverride: jest.fn(),
});

describe('AuthorizationGuard', () => {
  let reflector: MockReflector;
  let iamModuleOptions: IamModuleOptions;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Reflector,
          useValue: createReflectorMock(),
        },
        {
          provide: IAM_MODULE_OPTIONS_TOKEN,
          useValue: {},
        },
      ],
    }).compile();

    reflector = module.get<MockReflector>(Reflector);
    iamModuleOptions = module.get<IamModuleOptions>(IAM_MODULE_OPTIONS_TOKEN);
  });

  it('should be defined', () => {
    expect(
      new AuthorizationGuard(iamModuleOptions, reflector as Reflector),
    ).toBeDefined();
  });

  describe('canActivate()', () => {
    const request = {
      entity: null,
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => request),
      })),
      getType: jest.fn(() => 'http'),
    };

    afterEach(() => {
      reflector.getAllAndOverride.mockClear();
      request.entity = null;
    });

    it('should yield true if the requesting entity is authorized to complete the action', () => {
      // Arrange.
      const guard = new AuthorizationGuard(
        iamModuleOptions,
        reflector as Reflector,
      );
      const resource = 'FinalFantasyVII';
      const action = 'FightSephiroth';
      request.entity = {
        sub: randomUUID(),
        authorization_details: [`${resource}=${action}`],
      } as ActiveEntityData;
      reflector.getAllAndOverride.mockReturnValue({
        resource,
        action,
      } as IamPermissionOptions);

      // Act.
      const result = guard.canActivate(context as any);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if a permission is not specified', async () => {
      // Arrange.
      const guard = new AuthorizationGuard(
        iamModuleOptions,
        reflector as Reflector,
      );
      reflector.getAllAndOverride.mockReturnValue(null);

      // Act.
      const result = guard.canActivate(context as any);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield false otherwise', () => {
      // Arrange.
      const guard = new AuthorizationGuard(
        iamModuleOptions,
        reflector as Reflector,
      );
      const resource = 'FinalFantasyVII';
      const action = 'PlayMiniGame';
      request.entity = {
        sub: randomUUID(),
        authorization_details: [`${resource}=VisitShop`],
      } as ActiveEntityData;
      reflector.getAllAndOverride.mockReturnValue({
        resource,
        action,
      } as IamPermissionOptions);

      // Act.
      const result = guard.canActivate(context as any);

      // Assert.
      expect(result).toBeFalsy();
    });
  });
});
