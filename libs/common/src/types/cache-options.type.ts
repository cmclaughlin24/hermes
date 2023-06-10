export interface UseCacheOptions {
  /**
   * The key used to subsequently store and retreive cached data. Method's arguments
   * will be appended to the key to create a unique key hash.
   */
  key: string;

  /**
   * The cache expiration time (TTL) in milliseconds. Defaults to 5000.
   */
  ttl?: number;

  /**
   * A function that overrides the default key hashing algorithm. Should yield a unique
   * key hash for storing and retreiving cached data.
   * @param {string} key UseCacheOptions key
   * @param {any[]} args Method's arguments
   * @returns {string}
   */
  hashFn?: (key: string, args: any[]) => string;
}

export type RemoveCacheOptions = Omit<UseCacheOptions, 'ttl'>;