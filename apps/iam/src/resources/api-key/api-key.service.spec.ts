import { ExistsException, MissingException } from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import {
  MockHashingService,
  MockPermissionService,
  createCacheStoreMock,
  createHashingServiceMock,
  createPermissionServiceMock,
} from '../../../test/helpers/provider.helper';
import { HashingService } from '../../common/services/hashing.service';
import { CreatePermissionInput } from '../permission/dto/create-permission.input';
import { PermissionService } from '../permission/permission.service';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyInput } from './dto/create-api-key.input';
import { ApiKey } from './entities/api-key.entity';
import { InvalidApiKeyException } from './errors/invalid-api-key.exception';
import { ApiKeyRepository } from './repository/api-key.repository';

type MockApiKeyRepository = Partial<Record<keyof ApiKeyRepository, jest.Mock>>;

const createApiKeyRepositoryMock = (): MockApiKeyRepository => ({
  findById: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
});

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let repository: MockApiKeyRepository;
  let hashingService: MockHashingService;
  let permissionService: MockPermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: ApiKeyRepository,
          useValue: createApiKeyRepositoryMock(),
        },
        {
          provide: HashingService,
          useValue: createHashingServiceMock(),
        },
        {
          provide: PermissionService,
          useValue: createPermissionServiceMock(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: createCacheStoreMock(),
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    repository = module.get<MockApiKeyRepository>(ApiKeyRepository);
    hashingService = module.get<MockHashingService>(HashingService);
    permissionService = module.get<MockPermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const userId = randomUUID();
    const permission: CreatePermissionInput = {
      resource: 'api_key',
      action: 'create',
    };
    const createApiKeyInput: CreateApiKeyInput = {
      name: 'sonic-gems-collection',
      permissions: [permission],
    };

    afterEach(() => {
      repository.create.mockClear();
      hashingService.hash.mockClear();
      permissionService.findByResourceAction.mockClear();
    });

    it('should create an api key', async () => {
      // Arrange.
      permissionService.findByResourceAction.mockResolvedValue(permission);

      // Act.
      await service.create(createApiKeyInput, userId);

      // Assert.
      expect(repository.create).toHaveBeenCalled();
    });

    it('should hash the api key', async () => {
      // Arrange.
      permissionService.findByResourceAction.mockResolvedValue(permission);

      // Act.
      await service.create(createApiKeyInput, userId);

      // Assert.
      expect(hashingService.hash).toHaveBeenCalled();
    });

    it.todo('should yield the created api key');

    it('should throw an "ExistsException" if an api key name already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Api key with name=${createApiKeyInput.name} already exists!`,
      );
      permissionService.findByResourceAction.mockResolvedValue(permission);
      repository.create.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.create(createApiKeyInput, userId)).rejects.toEqual(
        expectedResult,
      );
    });

    it('should throw a "MissingException" if a permission does not exits', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Permission resource=${permission.resource} action=${permission.action} not found!`,
      );
      permissionService.findByResourceAction.mockResolvedValue(null);

      // Act/Assert.
      await expect(service.create(createApiKeyInput, userId)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('remove()', () => {
    const id = randomUUID();
    const userId = randomUUID();

    afterEach(() => {
      repository.remove.mockClear();
    });

    it('should yield the removed api key', async () => {
      // Arrange.
      const expectedResult: ApiKey = {
        id,
        name: 'disney-epic-mickey',
        apiKey: '$2b$10$7KoJXuChWGyP0z4YlhwBt.5HjGbuZF5T7vL0a51KBV.ulO9p.pPFG',
        expiresAt: new Date(),
        createdBy: userId,
        createdAt: new Date(),
        deletedBy: userId,
        deletedAt: new Date(),
      };
      repository.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(service.remove(id, userId)).resolves.toEqual(expectedResult);
    });

    it('should throw a "MissingException" if the api key does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Api key id=${id} not found!`,
      );
      repository.remove.mockRejectedValue(expectedResult);

      // Act/Assert.
      await expect(service.remove(id, userId)).rejects.toEqual(expectedResult);
    });
  });

  describe('verifyApiKey()', () => {
    const apiKey =
      'eyJzdWIiOiJmNzkyOGQyYi1mNDJjLTQzOTYtODlhYy1mZmZmN2EwYWYwZjciLCJhdXRob3JpemF0aW9uX2RldGFpbHMiOlsiZW1haWxfdGVtcGxhdGU9Y3JlYXRlIl19';

    afterEach(() => {
      repository.findById.mockClear();
      hashingService.compare.mockClear();
    });

    it('should yield an "ActiveEntityData" object if the api key is valid', async () => {
      // Arrange.
      const expectedResult = {
        sub: 'f7928d2b-f42c-4396-89ac-ffff7a0af0f7',
        authorization_details: ['email_template=create'],
      };
      repository.findById.mockResolvedValue({
        id: expectedResult.sub,
      });
      hashingService.compare.mockResolvedValue(true);

      // Act/Assert.
      await expect(service.verifyApiKey(apiKey)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw an "InvalidApiKeyException" if the api key is invalid (invalid hash)', async () => {
      // Arrange.
      repository.findById.mockResolvedValue({
        id: 'f7928d2b-f42c-4396-89ac-ffff7a0af0f7',
      });
      hashingService.compare.mockResolvedValue(false);

      // Act/Assert.
      await expect(service.verifyApiKey(apiKey)).rejects.toBeInstanceOf(
        InvalidApiKeyException,
      );
    });

    it.todo(
      'should throw an "InvalidApiKeyException" if the api key is invalid (expired)',
    );
  });
});
