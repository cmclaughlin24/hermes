import { defaultHashFn } from '@hermes/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { TokenStore } from '../interfaces/token-store.interface';

@Injectable()
export class TokenStorage {
  private static readonly CACHE_KEY = 'token-storage';

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Insert tokens into the storage.
   * @param {string} userId
   * @param {TokenStore} store
   */
  async insert(userId: string, store: TokenStore) {
    const cacheKey = this._generateCacheKey(userId);
    // Todo: Potential optimization would be to set the TTL in the cache equal to that of the refresh token.
    await this.cacheManager.set(cacheKey, store);
  }

  /**
   * Yields true if the refresh token is equal to the stored value or
   * false otherwise.
   * @param {string} userId
   * @param {string} tokenId
   * @returns {Promise<boolean>}
   */
  async validateRefresh(userId: string, tokenId: string) {
    const cacheKey = this._generateCacheKey(userId);
    const store = await this.cacheManager.get<TokenStore>(cacheKey);

    return tokenId === store?.refreshTokenId;
  }

  /**
   * Yields true if the json web token is equal to the stored value or
   * false otherwise.
   * @param {string} userId
   * @param {string} tokenId
   * @returns {Promise<boolean>}
   */
  async validateJwt(userId: string, tokenId: string) {
    const cacheKey = this._generateCacheKey(userId);
    const store = await this.cacheManager.get<TokenStore>(cacheKey);

    return tokenId === store?.jwtId;
  }

  /**
   * Removes tokens from storage.
   * @param {string} userId
   */
  async remove(userId: string) {
    const cacheKey = this._generateCacheKey(userId);
    await this.cacheManager.del(cacheKey);
  }

  private _generateCacheKey(userId: string) {
    return defaultHashFn(TokenStorage.CACHE_KEY, [userId]);
  }
}
