import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { UseCacheOptions } from '../types/cache-options.type';
import { defaultHashFn } from '../utils/cache.utils';

const DEFAULT_TTL = 5000;

/**
 * Decorator that marks a method that should utilize cache storage for
 * responses. It implements a monkey patch to wrap the original method 
 * call with logic to check if the cache storage contains a key and either
 * (1) yield it's value or (2) yield the value of the original method
 * after setting it in the cache.
 * 
 * Note: Requires the @nestjs/cache-manager CacheModule to be imported
 *       into the module where the decorator is used. Extends the module's
 *       features to enable auto-caching and removal w/o the use of
 *       interceptors.
 *
 * @param {UseCacheOptions} options
 * @returns {MethodDecorator}
 */
export const UseCache = (options: UseCacheOptions): MethodDecorator => {
  const logger = new Logger(UseCache.name);
  const injectCache = Inject(CACHE_MANAGER);

  if (typeof options.key !== 'string') {
    throw new Error("Invalid UseCacheOption: 'key' is not type string");
  }

  if (options.hashFn && typeof options.hashFn !== 'function') {
    throw new Error("Invalid UseCacheOption: 'hashFn' is not type function");
  }

  if (options.ttl != null && typeof options.ttl !== 'number') {
    throw new Error("Invalid UseCacheOption: 'ttl' is not type function");
  }

  const hashFn = options.hashFn || defaultHashFn;
  const ttl = options.ttl != null ? options.ttl : DEFAULT_TTL;

  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const method = descriptor.value;
    injectCache(target, 'cacheManager');

    descriptor.value = async function (...args: any[]) {
      const cacheKey = hashFn(options.key, args);
      let value;

      try {
        value = await this.cacheManager.get(cacheKey);

        if (value) {
          logger.verbose(`Returning cached value for key=${cacheKey}`);

          return value;
        }
      } catch (error) {
        logger.error(
          `An error occurred while retreiving value from cache: ${error.message}`,
        );
      }

      value = await method.apply(this, args);

      try {
        logger.verbose(`Setting value for key=${cacheKey} in cache`);

        await this.cacheManager.set(cacheKey, value, ttl);
      } catch (error) {
        logger.error(
          `An error occurred setting value in cache: ${error.message}`,
        );
      }

      return value;
    };
  };
};
