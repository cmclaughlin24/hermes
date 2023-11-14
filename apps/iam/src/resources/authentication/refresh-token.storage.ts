import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RefreshTokenStorage {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
}
