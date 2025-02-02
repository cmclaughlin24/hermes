import { ExistsException, MissingException } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { CreatePermissionInput } from './dto/create-permission.input';
import { UpdatePermissionInput } from './dto/update-permission.input';
import { Permission } from './repository/entities/permission.entity';
import { PermissionService } from './permission.service';
import { PermissionRepository } from './repository/permission.repository';

type MockPermissionRepository = Partial<
  Record<keyof PermissionRepository, jest.Mock>
>;

const createPermissionRepositoryMock = (): MockPermissionRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByResourceAction: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('PermissionService', () => {
  let service: PermissionService;
  let permissionRepository: MockPermissionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: PermissionRepository,
          useValue: createPermissionRepositoryMock(),
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    permissionRepository =
      module.get<MockPermissionRepository>(PermissionRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    afterEach(() => {
      permissionRepository.findAll.mockClear();
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
      permissionRepository.findAll.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual(expectedResult);
    });

    it('should yield an empty list if the repository returns an empty list', async () => {
      // Arrange.
      permissionRepository.findAll.mockResolvedValue([]);

      // Act/Assert.
      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe('findById()', () => {
    const permissionId = randomUUID();

    afterEach(() => {
      permissionRepository.findById.mockClear();
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
      permissionRepository.findById.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.findById(permissionId)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      permissionRepository.findById.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.findById(permissionId)).resolves.toBeNull();
    });
  });

  describe('findByResourceAction()', () => {
    const resource = 'VideoGame';
    const action = 'get';

    afterEach(() => {
      permissionRepository.findByResourceAction.mockClear();
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
      permissionRepository.findByResourceAction.mockResolvedValue(
        expectedResult,
      );

      // Act/Assert.
      await expect(
        service.findByResourceAction(resource, action),
      ).resolves.toEqual(expectedResult);
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      permissionRepository.findByResourceAction.mockResolvedValue(null);

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
      permissionRepository.create.mockClear();
    });

    it('should create a permission', async () => {
      // Arrange.
      permissionRepository.create.mockResolvedValue({});

      // Act.
      await service.create(createPermissionInput);

      // Assert.
      expect(permissionRepository.create).toHaveBeenCalled();
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
      permissionRepository.create.mockResolvedValue(expectedResult);

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
      permissionRepository.create.mockRejectedValue(expectedResult);

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
      permissionRepository.update.mockClear();
    });

    it('should update a permission', async () => {
      // Arrange.
      permissionRepository.update.mockResolvedValue(null);

      // Act.
      await service.update(permissionId, updatePermissionInput);

      // Assert.
      expect(permissionRepository.update).toHaveBeenCalled();
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
      permissionRepository.update.mockResolvedValue(expectedResult);

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
      permissionRepository.update.mockRejectedValue(expectedResult);

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
      permissionRepository.update.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(
        service.update(permissionId, updatePermissionInput),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const permissionId = randomUUID();

    afterEach(() => {
      permissionRepository.remove.mockClear();
    });

    it('should remove a permission', async () => {
      // Arrange.
      permissionRepository.remove.mockResolvedValue({});

      // Act.
      await service.remove(permissionId);

      // Assert.
      expect(permissionRepository.remove).toHaveBeenCalled();
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
      permissionRepository.remove.mockResolvedValue(expectedResult);

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
      permissionRepository.remove.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.remove(permissionId)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
