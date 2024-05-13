import { defaultHashFn } from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import {
  MockCacheStore,
  createCacheStoreMock,
} from '../../../test/helpers/provider.helper';
import { TokenStore } from '../interfaces/token-store.interface';
import { TokenStorage } from './token.storage';

describe('RefreshTokenStorage', () => {
  let storage: TokenStorage;
  let cacheManager: MockCacheStore;

  const userId = randomUUID();
  const jwtId = randomUUID();
  const refreshTokenId = randomUUID();
  const store: TokenStore = {
    jwtId: jwtId,
    refreshTokenId: refreshTokenId,
  };
  const cacheKey = defaultHashFn('token-storage', [userId]);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenStorage,
        {
          provide: CACHE_MANAGER,
          useValue: createCacheStoreMock(),
        },
      ],
    }).compile();

    storage = module.get<TokenStorage>(TokenStorage);
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
      await storage.insert(userId, store);

      // Assert.
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, store);
    });
  });

  describe('validateRefresh()', () => {
    afterEach(() => {
      cacheManager.get.mockClear();
    });

    it("should yield true if the user's refresh token id is equal to the cached token id", async () => {
      // Arrange.
      cacheManager.get.mockResolvedValue(store);

      // Act/Assert.
      await expect(
        storage.validateRefresh(userId, refreshTokenId),
      ).resolves.toBeTruthy();
    });

    it('should yield false otherwise (not equal)', async () => {
      // Arrange.
      cacheManager.get.mockResolvedValue({ refreshTokenId: randomUUID() });

      // Act/Assert.
      await expect(
        storage.validateRefresh(userId, refreshTokenId),
      ).resolves.toBeFalsy();
    });

    it('should yield false otherwise (null/undefined)', async () => {
      // Arrange.
      cacheManager.get.mockResolvedValue(null);

      // Act/Assert.
      await expect(
        storage.validateRefresh(userId, refreshTokenId),
      ).resolves.toBeFalsy();
    });
  });

  describe('validateJwt()', () => {
    afterEach(() => {
      cacheManager.get.mockClear();
    });

    it("should yield true if the user's refresh token id is equal to the cached token id", async () => {
      // Arrange.
      cacheManager.get.mockResolvedValue(store);

      // Act/Assert.
      await expect(storage.validateJwt(userId, jwtId)).resolves.toBeTruthy();
    });

    it('should yield false otherwise (not equal)', async () => {
      // Arrange.
      cacheManager.get.mockResolvedValue({ jwtId: randomUUID() });

      // Act/Assert.
      await expect(storage.validateJwt(userId, jwtId)).resolves.toBeFalsy();
    });

    it('should yield false otherwise (null/undefined)', async () => {
      // Arrange.
      cacheManager.get.mockResolvedValue(null);

      // Act/Assert.
      await expect(storage.validateJwt(userId, jwtId)).resolves.toBeFalsy();
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
