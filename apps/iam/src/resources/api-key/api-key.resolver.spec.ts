import { ApolloServerErrorCode } from '@apollo/server/errors';
import { ExistsException, MissingException } from '@hermes/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { GraphQLError } from 'graphql';
import { ActiveEntityData } from '../../common/entities/active-entity.entity';
import { GraphQLErrorCode } from '../../common/types/graphql-error-code.type';
import { ApiKeyResolver } from './api-key.resolver';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyInput } from './dto/create-api-key.input';
import { ApiKey } from './entities/api-key.entity';
import { InvalidApiKeyException } from './errors/invalid-api-key.exception';

type MockApiKeyService = Partial<Record<keyof ApiKeyService, jest.Mock>>;

const createApiKeyServiceMock = (): MockApiKeyService => ({
  create: jest.fn(),
  remove: jest.fn(),
  verifyApiKey: jest.fn(),
});

describe('ApiKeyResolver', () => {
  let resolver: ApiKeyResolver;
  let service: MockApiKeyService;

  const userId = 'marcus-fenix';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyResolver,
        { provide: ApiKeyService, useValue: createApiKeyServiceMock() },
      ],
    }).compile();

    resolver = module.get<ApiKeyResolver>(ApiKeyResolver);
    service = module.get<MockApiKeyService>(ApiKeyService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('create()', () => {
    const createApiKeyInput: CreateApiKeyInput = {
      name: 'gears-of-war',
      permissions: [{ resource: 'api_key', action: 'create' }],
    };

    afterEach(() => {
      service.create.mockClear();
    });

    it('should yield the created api key', async () => {
      // Arrange.
      const expectedResult =
        'eyJzdWIiOiIxNzg0ZDdiNC0wNGE3LTRjNzQtYmQ5NS03MjZiNjE1NDNkODgiLCJhdXRob3JpemF0aW9uX2RldGFpbHMiOlsiZW1haWxfdGVtcGxhdGU9Y3JlYXRlIl19';
      service.create.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(resolver.create(createApiKeyInput, userId)).resolves.toBe(
        expectedResult,
      );
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if the an api key name already exists for a user', async () => {
      // Arrange.
      const errorMessage = `Api key with name=${createApiKeyInput.name} already exists for user id=${userId}!`;
      const expectedResult = new GraphQLError(errorMessage, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
      service.create.mockRejectedValue(new ExistsException(errorMessage));

      // Act/Assert.
      await expect(resolver.create(createApiKeyInput, userId)).rejects.toEqual(
        expectedResult,
      );
    });
  });

  describe('remove()', () => {
    afterEach(() => {
      service.remove.mockClear();
    });

    it('should yield the removed api key', async () => {
      // Arrange.
      const expectedResult: ApiKey = {
        id: randomUUID(),
        name: 'gears-of-war-2',
        apiKey: '',
        createdBy: userId,
        createdAt: new Date(),
        deletedBy: null,
        deletedAt: null,
      };
      service.remove.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(resolver.remove(expectedResult.id, userId)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "GraphQLError" with a "BAD_USER_INPUT" code if the api key does not exist', async () => {
      // Arrange.
      const id = randomUUID();
      const errorMessage = `Api key id=${id} not found!`;
      const expectedResult = new GraphQLError(errorMessage, {
        extensions: { code: ApolloServerErrorCode.BAD_REQUEST },
      });
      service.remove.mockRejectedValue(new MissingException(errorMessage));

      // Act/Assert.
      await expect(resolver.remove(id, userId)).rejects.toEqual(expectedResult);
    });
  });

  describe('verifyApiKey()', () => {
    const apiKey =
      'eyJzdWIiOiIxNzg0ZDdiNC0wNGE3LTRjNzQtYmQ5NS03MjZiNjE1NDNkODgiLCJhdXRob3JpemF0aW9uX2RldGFpbHMiOlsiZW1haWxfdGVtcGxhdGU9Y3JlYXRlIl19';

    afterEach(() => {
      service.verifyApiKey.mockClear();
    });

    it('should yield an "ActiveEntityData" object if the api key is valid', async () => {
      // Arrange.
      const expectedResult: ActiveEntityData = {
        name: 'Gears of War',
        sub: randomUUID(),
        authorization_details: ['Actions=FightLocus'],
      };
      service.verifyApiKey.mockResolvedValue(expectedResult);

      // Act/Assert.
      await expect(resolver.verifyApiKey(apiKey)).resolves.toEqual(
        expectedResult,
      );
    });

    it('should throw a "GraphQLError" with an "UNAUTHENTICATED" code if the api key is invalid', async () => {
      // Arrange.
      const expectedResult = new GraphQLError('Unauthorized: Invalid api key', {
        extensions: { code: GraphQLErrorCode.UNAUTHENTICATED_ERROR_CODE },
      });
      service.verifyApiKey.mockRejectedValue(new InvalidApiKeyException());

      // Act/Assert.
      await expect(resolver.verifyApiKey(apiKey)).rejects.toEqual(
        expectedResult,
      );
    });
  });
});
