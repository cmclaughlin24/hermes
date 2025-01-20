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
} from '../../../test/helpers/database.helper';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';
import { Permission } from './repository/entities/permission.entity';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useValue: createMockRepository<Permission>(),
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    repository = module.get<MockRepository>(getRepositoryToken(Permission));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      repository.find.mockClear();
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
      repository.find.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      repository.find.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe('findById()', () => {
    const permissionId = randomUUID();

    afterEach(() => {
      repository.findOneBy.mockClear();
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
      repository.findOneBy.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findById(permissionId)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      repository.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findById(permissionId)).resolves.toBeNull();
    });
  });

  describe('findByResourceAction()', () => {
    const resource = 'VideoGame';
    const action = 'get';

    afterEach(() => {
      repository.findOneBy.mockClear();
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
      repository.findOneBy.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.findByResourceAction(resource, action),
      ).resolves.toEqual(expectedResult);
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      repository.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.findByResourceAction(resource, action),
      ).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    const createPermissionInput: CreatePermissionInput = {
      resource: 'VideoGame',
      action: 'create',
    };

    afterEach(() => {
      repository.create.mockClear();
      repository.save.mockClear();
    });

    it('should create a permission', async () => {
      // Arrange.
      repository.create.mockResolvedValue({});
      repository.save.mockResolvedValue(null);

      // Act.
      await service.create(createPermissionInput);

      // Assert.
      expect(repository.create).toHaveBeenCalled();
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
      repository.save.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.create(createPermissionInput)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw an "ExistsException" if the resource and action combination already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Permission for resource=${createPermissionInput.resource} action=${createPermissionInput.action} already exists!`,
      );
      repository.save.mockRejectedValue({
        code: PostgresError.UNIQUE_VIOLATION,
      });

      // Act/Assert.
      await expect(service.create(createPermissionInput)).rejects.toEqual(
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
      repository.preload.mockClear();
      repository.save.mockClear();
    });

    it('should update a permission', async () => {
      // Arrange.
      repository.preload.mockResolvedValue({});
      repository.save.mockResolvedValue(null);

      // Act.
      await service.update(permissionId, updatePermissionInput);

      // Assert.
      expect(repository.preload).toHaveBeenCalled();
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
      repository.preload.mockResolvedValue({});
      repository.save.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.update(permissionId, updatePermissionInput),
      ).resolves.toEqual(expectedResult);
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Permission id=${permissionId} not found!`,
      );
      repository.preload.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        service.update(permissionId, updatePermissionInput),
      ).rejects.toEqual(expectedResult);
    });

    it('should throw an "ExistsException" if the resource and action combination already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Permission for resource=${updatePermissionInput.resource} action=${updatePermissionInput.action} already exists!`,
      );
      repository.preload.mockResolvedValue({});
      repository.save.mockRejectedValue({
        code: PostgresError.UNIQUE_VIOLATION,
      });

      // Act/Assert.
      await expect(
        service.update(permissionId, updatePermissionInput),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const permissionId = randomUUID();

    afterEach(() => {
      repository.findOneBy.mockClear();
      repository.remove.mockClear();
    });

    it('should remove a permission', async () => {
      // Arrange.
      repository.findOneBy.mockResolvedValue({});

      // Act.
      await service.remove(permissionId);

      // Assert.
      expect(repository.remove).toHaveBeenCalled();
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
      repository.findOneBy.mockResolvedValue({});
      repository.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.remove(permissionId)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "MissingException" if the repository returns null/undefined', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Permission id=${permissionId} not found!`,
      );
      repository.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.remove(permissionId)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
