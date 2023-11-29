import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import {
  MockPermissionService,
  createPermissionServiceMock,
} from '../../../../test/helpers/provider.helper';
import { Permission } from '../../permission/entities/permission.entity';
import { PermissionService } from '../../permission/permission.service';
import { User } from '../entities/user.entity';
import { UserPermissionResolver } from './user-permission.resolver';

describe('UserPermissionResolver', () => {
  let resolver: UserPermissionResolver;
  let service: MockPermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPermissionResolver,
        {
          provide: PermissionService,
          useValue: createPermissionServiceMock(),
        },
      ],
    }).compile();

    resolver = module.get<UserPermissionResolver>(UserPermissionResolver);
    service = module.get<MockPermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getUserPermissions()', () => {
    const userId = randomUUID();

    afterEach(() => {
      service.findUserPermissions.mockClear();
    });

    it('should yield a list of permissions assigned to the user', async () => {
      // Arrange.
      const expectedResult: Permission[] = [
        {
          id: randomUUID(),
          resource: 'VideoGameConsole',
          action: 'list',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      service.findUserPermissions.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        resolver.getUserPermissions({ id: userId } as User),
      ).resolves.toEqual(expectedResult);
    });
  });
});
