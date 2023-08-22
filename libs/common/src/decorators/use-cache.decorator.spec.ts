import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { UseCache } from './use-cache.decorator';

export type MockCacheStore = Partial<Record<keyof CacheStore, jest.Mock>>;

export const createCacheStoreMock = (): MockCacheStore => ({
  get: jest.fn(),
  set: jest.fn(),
});

describe('UseCache', () => {
  let cacheStore: MockCacheStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CACHE_MANAGER,
          useValue: createCacheStoreMock(),
        },
      ],
    }).compile();

    cacheStore = module.get<MockCacheStore>(CACHE_MANAGER);
  });

  afterEach(() => {
    cacheStore.get.mockClear();
    cacheStore.set.mockClear();
  });

  it.todo(
    "should yield the cache storage's value if the cache storage returns a value",
  );

  it.todo(
    "should yield the original method's value if the cache storage returns null/undefined",
  );

  it.todo(
    "should yield the original method's value if the cache storage throws an error fetching from storage",
  );

  it.todo(
    "should yield the original method's if the cache storage throws an error setting in storage",
  );

  it.todo("should set the original method's value in cache storage");

  it("should throw an exception if the options 'key' property is not a string (number)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid UseCacheOption: 'key' is not type string",
    );
    const options = { key: 999 };

    // Act
    const decoratorFactory = UseCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'key' property is not a string (boolean)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid UseCacheOption: 'key' is not type string",
    );
    const options = { key: true };

    // Act
    const decoratorFactory = UseCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'key' property is not a string (function)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid UseCacheOption: 'key' is not type string",
    );
    const options = { key: () => {} };

    // Act
    const decoratorFactory = UseCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'hasFn' property is defined and not a function (string)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid UseCacheOption: 'hashFn' is not type function",
    );
    const options = { key: 'unit-test', hashFn: 'unit-test' };

    // Act
    const decoratorFactory = UseCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'hasFn' property is defined and not a function (number)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid UseCacheOption: 'hashFn' is not type function",
    );
    const options = { key: 'unit-test', hashFn: 999 };

    // Act
    const decoratorFactory = UseCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'hasFn' property is defined and not a function (boolean)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid UseCacheOption: 'hashFn' is not type function",
    );
    const options = { key: 'unit-test', hashFn: true };

    // Act
    const decoratorFactory = UseCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'ttl' property is defined and not a number (string)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid UseCacheOption: 'ttl' is not type function",
    );
    const options = { key: 'unit-test', ttl: 'unit-test' };

    // Act
    const decoratorFactory = UseCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'ttl' property is defined and not a number (boolean)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid UseCacheOption: 'ttl' is not type function",
    );
    const options = { key: 'unit-test', ttl: true };

    // Act
    const decoratorFactory = UseCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'ttl' property is defined and not a number (function)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid UseCacheOption: 'ttl' is not type function",
    );
    const options = { key: 'unit-test', ttl: () => {} };

    // Act
    const decoratorFactory = UseCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });
});
