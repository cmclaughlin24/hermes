import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { Permission } from '../../permission/repository/entities/permission.entity';
import { UserPermissionLoader } from '../data-loaders/user-permission.loader';
import { User } from '../repository/entities/user.entity';
import { UserPermissionResolver } from './user-permission.resolver';

type MockUserPermissionLoader = Partial<
  Record<keyof UserPermissionLoader, jest.Mock>
>;

const createUserPermissionLoaderMock = (): MockUserPermissionLoader => ({
  load: jest.fn(),
});

describe('UserPermissionResolver', () => {
  let resolver: UserPermissionResolver;
  let loader: MockUserPermissionLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPermissionResolver,
        {
          provide: UserPermissionLoader,
          useValue: createUserPermissionLoaderMock(),
        },
      ],
    }).compile();

    resolver = module.get<UserPermissionResolver>(UserPermissionResolver);
    loader =
      await module.resolve<MockUserPermissionLoader>(UserPermissionLoader);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getUserPermissions()', () => {
    const userId = randomUUID();

    afterEach(() => {
      loader.load.mockClear();
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
      loader.load.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        resolver.getUserPermissions({ id: userId } as User),
      ).resolves.toEqual(expectedResult);
    });
  });
});
