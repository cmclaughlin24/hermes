import { defaultHashFn } from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import {
  MockCacheStore,
  createCacheStoreMock,
} from '../../../../iam/test/helpers/provider.helper';
import { RefreshTokenStorage } from './refresh-token.storage';

describe('RefreshTokenStorage', () => {
  let storage: RefreshTokenStorage;
  let cacheManager: MockCacheStore;

  const userId = randomUUID();
  const tokenId = randomUUID();
  const cacheKey = defaultHashFn('refresh-token-storage', [userId]);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenStorage,
        {
          provide: CACHE_MANAGER,
          useValue: createCacheStoreMock(),
        },
      ],
    }).compile();

    storage = module.get<RefreshTokenStorage>(RefreshTokenStorage);
    cacheManager = module.get<MockCacheStore>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(storage).toBeDefined();
  });

  describe('insert()', () => {
    afterEach(() => {
      cacheManager.set.mockClear();
    });

    it('should insert the refresh token id into cache storage', async () => {
      // Act.
      await storage.insert(userId, tokenId);

      // Assert.
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, tokenId);
    });
  });

  describe('validate()', () => {
    afterEach(() => {
      cacheManager.get.mockClear();
    });

    it("should yield true if the user's refresh token id is equal to the cached token id", async () => {
      // Arrange.
      cacheManager.get.mockResolvedValue(tokenId);

      // Act/Assert.
      await expect(storage.validate(userId, tokenId)).resolves.toBeTruthy();
    });

    it('should yield false otherwise (not equal)', async () => {
      // Arrange.
      cacheManager.get.mockResolvedValue('unit-test');

      // Act/Assert.
      await expect(storage.validate(userId, tokenId)).resolves.toBeFalsy();
    });

    it('should yield false otherwise (null/undefined)', async () => {
      // Arrange.
      cacheManager.get.mockResolvedValue(null);

      // Act/Assert.
      await expect(storage.validate(userId, tokenId)).resolves.toBeFalsy();
    });
  });

  describe('remove()', () => {
    afterEach(() => {
      cacheManager.del.mockClear();
    });

    it('should remove the refresh token from cache storage', async () => {
      // Act.
      await storage.remove(userId);

      // Assert.
      expect(cacheManager.del).toHaveBeenCalledWith(cacheKey);
    });
  });
});
