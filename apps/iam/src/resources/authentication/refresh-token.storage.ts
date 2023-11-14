import { defaultHashFn } from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RefreshTokenStorage {
  private static readonly CACHE_KEY = 'refresh-token-storage';

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Insert a refresh token into the storage.
   * @param {string} userId
   * @param {string} tokenId
   */
  async insert(userId: string, tokenId: string) {
    const cacheKey = defaultHashFn(RefreshTokenStorage.CACHE_KEY, [userId]);
    // Todo: Potential optimization would be to set the TTL in the cache equal to that of the refresh token.
    await this.cacheManager.set(cacheKey, tokenId);
  }

  /**
   * Yields true if the refresh token is equal to the stored value or
   * false otherwise.
   * @param {string} userId
   * @param {string} tokenId
   * @returns {Promise<boolean>}
   */
  async validate(userId: string, tokenId: string) {
    const cacheKey = defaultHashFn(RefreshTokenStorage.CACHE_KEY, [userId]);
    const cacheTokenId = await this.cacheManager.get(cacheKey);

    return tokenId === cacheTokenId;
  }

  /**
   * Removes a refresh token from storage.
   * @param {string} userId
   */
  async remove(userId: string) {
    const cacheKey = defaultHashFn(RefreshTokenStorage.CACHE_KEY, [userId]);
    await this.cacheManager.del(cacheKey);
  }
}
