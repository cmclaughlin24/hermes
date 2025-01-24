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
import { OrmApiKeyRepository } from './orm-api-key.repository';
import { ApiKey } from '../entities/api-key.entity';

describe('OrmApiKeyRepository', () => {
  let repository: OrmApiKeyRepository;
  let apiKeyModel: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrmApiKeyRepository,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: createMockRepository<ApiKey>(),
        },
      ],
    }).compile();

    repository = module.get<OrmApiKeyRepository>(OrmApiKeyRepository);
    apiKeyModel = module.get<MockRepository>(getRepositoryToken(ApiKey));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById()', () => {
    afterEach(() => {
      apiKeyModel.findOneBy.mockClear();
    });

    it('should yield an api key', async () => {
      // Arrange.
      const expectedResult: ApiKey = {
        id: randomUUID(),
        name: 'space-marine-2',
        expiresAt: new Date(),
        createdBy: 'lt. titus',
      } as ApiKey;
      apiKeyModel.findOneBy.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.findById(expectedResult.name)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should yield null if the repository returns null/undefined', async () => {
      // Arrange.
      const name = 'test';
      apiKeyModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.findById(name)).resolves.toBeNull();
    });
  });

  describe('create()', () => {
    const userId = randomUUID();
    const name = 'sonic-gems-collection';

    afterEach(() => {
      apiKeyModel.create.mockClear();
      apiKeyModel.save.mockClear();
    });

    it('should create an api key', async () => {
      // Assert.
      apiKeyModel.save.mockResolvedValue({} as ApiKey);

      // Act.
      await repository.create({
        id: '',
        name,
        apiKey: '',
        expiresAt: new Date(),
        createdBy: userId,
      });

      // Assert.
      expect(apiKeyModel.create).toHaveBeenCalled();
    });

    it.todo('should yield the created api key');

    it('should throw an "ExistsException" if an api key name already exists', async () => {
      // Arrange.
      const expectedResult = new ExistsException(
        `Api key with name=${name} already exists!`,
      );
      apiKeyModel.save.mockRejectedValue({
        code: PostgresError.UNIQUE_VIOLATION,
      });

      // Act/Assert.
      await expect(
        repository.create({
          id: '',
          name,
          apiKey: '',
          expiresAt: new Date(),
          createdBy: userId,
        }),
      ).rejects.toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    const id = randomUUID();
    const userId = randomUUID();

    afterEach(() => {
      apiKeyModel.findOneBy.mockClear();
      apiKeyModel.save.mockClear();
    });

    it('should soft (paranoid) remove the api key', async () => {
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
      apiKeyModel.findOneBy.mockResolvedValue(expectedResult);

      // Act.
      await repository.remove(id, userId);

      // Assert.
      expect(apiKeyModel.save).toHaveBeenCalledWith(expectedResult);
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
      apiKeyModel.findOneBy.mockResolvedValue(expectedResult);
      apiKeyModel.save.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(repository.remove(id, userId)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "MissingException" if the api key does not exist', async () => {
      // Arrange.
      const expectedResult = new MissingException(
        `Api key id=${id} not found!`,
      );
      apiKeyModel.findOneBy.mockResolvedValue(null);

      // Act/Assert.
      await expect(repository.remove(id, userId)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
