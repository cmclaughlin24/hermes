import {
  ExistsException,
  MissingException,
  PostgresError,
} from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import {
  MockRepository,
  createMockRepository,
} from '../../../../test/helpers/database.helper';
import { CreatePermissionInput } from '../dto/create-permission.input';
import { UpdatePermissionInput } from '../dto/update-permission.input';
import { Permission } from './entities/permission.entity';
import { OrmPermissionRepository } from './orm-permission.repository';

describe('OrmPermissionRepository', () => {
  let repository: OrmPermissionRepository;
  let permissionModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrmPermissionRepository,
        {
          provide: getRepositoryToken(Permission),
          useValue: createMockRepository<Permission>(),
        },
      ],
    }).compile();

    repository = module.get<OrmPermissionRepository>(
      OrmPermissionRepository,
    );
    permissionModel = module.get<MockRepository>(
      getRepositoryToken(Permission),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      permissionModel.find.mockClear();
    });

    it('should yield a list of permissions', async () => {
      // Arrange.
      const expectedResult: Permission[] = [
        {
          id: randomUUID(),
          resource: 'VideoGame',
          action: 'list',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      permissionModel.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      permissionModel.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(repository.findAll()).resolves.toEqual([]);
    });
  });

  describe('findById()', () => {
    const permissionId = randomUUID();

    afterEach(() => {
      permissionModel.findOneBy.mockClear();
    });

    it('should yield a permission', async () => {
      // Arrange.
      const expectedResult: Permission = {
        id: permissionId,
        resource: 'VideoGame',
        action: 'get',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      permissionModel.findOneBy.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findById(permissionId)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      permissionModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.findById(permissionId)).resolves.toBeNull();
    });
  });

  describe('findByResourceAction()', () => {
    const resource = 'VideoGame';
    const action = 'get';

    afterEach(() => {
      permissionModel.findOneBy.mockClear();
    });

    it('should yield a permission', async () => {
      // Arrange.
      const expectedResult: Permission = {
        id: randomUUID(),
        resource,
        action,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      permissionModel.findOneBy.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        repository.findByResourceAction(resource, action),
      ).resolves.toEqual(expectedResult);
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      permissionModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        repository.findByResourceAction(resource, action),
      ).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    const createPermissionInput: CreatePermissionInput = {
      resource: 'VideoGame',
      action: 'create',
    };

    afterEach(() => {
      permissionModel.create.mockClear();
      permissionModel.save.mockClear();
    });

    it('should create a permission', async () => {
      // Arrange.
      permissionModel.create.mockResolvedValue({});
      permissionModel.save.mockResolvedValue(null);

      // Act.
      await repository.create(createPermissionInput);

      // Assert.
      expect(permissionModel.create).toHaveBeenCalled();
    });

    it('should yield the created permission', async () => {
      // Arrange.
      const expectedResult: Permission = {
        id: randomUUID(),
        resource: createPermissionInput.resource,
        action: createPermissionInput.action,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      permissionModel.save.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.create(createPermissionInput)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw an "ExistsException" if the resource and action combination already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Permission for resource=${createPermissionInput.resource} action=${createPermissionInput.action} already exists!`,
      );
      permissionModel.save.mockRejectedValue({
        code: PostgresError.UNIQUE_VIOLATION,
      });

      // Act/Assert.
      await expect(repository.create(createPermissionInput)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('update()', () => {
    const permissionId = randomUUID();
    const updatePermissionInput: UpdatePermissionInput = {
      resource: 'VideoGame',
      action: 'update',
    };

    afterEach(() => {
      permissionModel.preload.mockClear();
      permissionModel.save.mockClear();
    });

    it('should update a permission', async () => {
      // Arrange.
      permissionModel.preload.mockResolvedValue({});
      permissionModel.save.mockResolvedValue(null);

      // Act.
      await repository.update(permissionId, updatePermissionInput);

      // Assert.
      expect(permissionModel.preload).toHaveBeenCalled();
    });

    it('should yield the updated permission', async () => {
      // Arrange.
      const expectedResult: Permission = {
        id: permissionId,
        resource: updatePermissionInput.resource,
        action: updatePermissionInput.action,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      permissionModel.preload.mockResolvedValue({});
      permissionModel.save.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        repository.update(permissionId, updatePermissionInput),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Permission id=${permissionId} not found!`,
      );
      permissionModel.preload.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        repository.update(permissionId, updatePermissionInput),
      ).rejects.toEqual(expectedResult);
    });

    it('should throw an "ExistsException" if the resource and action combination already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Permission for resource=${updatePermissionInput.resource} action=${updatePermissionInput.action} already exists!`,
      );
      permissionModel.preload.mockResolvedValue({});
      permissionModel.save.mockRejectedValue({
        code: PostgresError.UNIQUE_VIOLATION,
      });

      // Act/Assert.
      await expect(
        repository.update(permissionId, updatePermissionInput),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const permissionId = randomUUID();

    afterEach(() => {
      permissionModel.findOneBy.mockClear();
      permissionModel.remove.mockClear();
    });

    it('should remove a permission', async () => {
      // Arrange.
      permissionModel.findOneBy.mockResolvedValue({});

      // Act.
      await repository.remove(permissionId);

      // Assert.
      expect(permissionModel.remove).toHaveBeenCalled();
    });

    it('should yield the removed permission', async () => {
      // Arrange.
      const expectedResult: Permission = {
        id: permissionId,
        resource: 'VideoGame',
        action: 'remove',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      permissionModel.findOneBy.mockResolvedValue({});
      permissionModel.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.remove(permissionId)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Permission id=${permissionId} not found!`,
      );
      permissionModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.remove(permissionId)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
