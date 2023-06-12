import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { RemoveCacheOptions } from '../types/cache-options.type';
import { defaultHashFn } from '../utils/cache.utils';

/**
 * Decorator that marks a method that should remove an item from cache
 * storage. It implements a monkey patch to wrap the original method
 * call with logic to remove a key from the cache storage.
 * 
 * Due to the I/O operations required to interact with the cache store,
 * methods decoratored by `RemoveCache` will resolve as a `Promise`.
 * 
 * Note: Requires the @nestjs/cache-manager CacheModule to be imported
 *       into the module where the decorator is used. Extends the module's
 *       features to enable auto-caching and removal w/o the use of
 *       interceptors.
 * 
 * @param {RemoveCacheOptions} options
 * @returns {MethodDecorator}
 */
export const RemoveCache = (options: RemoveCacheOptions): MethodDecorator => {
  const logger = new Logger(RemoveCache.name);
  const injectCache = Inject(CACHE_MANAGER);

  if (typeof options.key !== 'string') {
    throw new Error("Invalid UseCacheOption: 'key' is not type string");
  }

  if (options.hashFn && typeof options.hashFn !== 'function') {
    throw new Error("Invalid UseCacheOption: 'hashFn' is not type function");
  }

  const hashFn = options.hashFn || defaultHashFn;

  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const method = descriptor.value;
    injectCache(target, 'cacheManager');

    descriptor.value = async function (...args: any[]) {
      const cacheKey = hashFn(options.key, args);
      const value = await method.apply(this, args);

      try {
        logger.verbose(`Removing value for key=${cacheKey} from cache`);

        await this.cacheManager.del(cacheKey);
      } catch (error) {
        logger.error(
          `An error occurred removing value from cache: ${error.message}`,
        );
      }

      return value;
    };
  };
};
