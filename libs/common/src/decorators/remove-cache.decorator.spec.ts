import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { RemoveCache } from './remove-cache.decorator';

export type MockCacheStore = Partial<Record<keyof Cache, jest.Mock>>;

export const createCacheStoreMock = (): MockCacheStore => ({
  get: jest.fn(),
  set: jest.fn(),
});

describe('RemoveCache', () => {
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

  it("should throw an exception if the options 'key' property is not a string (number)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid RemoveCacheOptions: 'key' is not type string",
    );
    const options = { key: 999 };

    // Act
    const decoratorFactory = RemoveCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'key' property is not a string (boolean)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid RemoveCacheOptions: 'key' is not type string",
    );
    const options = { key: true };

    // Act
    const decoratorFactory = RemoveCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'key' property is not a string (function)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid RemoveCacheOptions: 'key' is not type string",
    );
    const options = { key: () => {} };

    // Act
    const decoratorFactory = RemoveCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'hasFn' property is defined and not a function (string)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid RemoveCacheOptions: 'hashFn' is not type function",
    );
    const options = { key: 'unit-test', hashFn: 'unit-test' };

    // Act
    const decoratorFactory = RemoveCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'hasFn' property is defined and not a function (number)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid RemoveCacheOptions: 'hashFn' is not type function",
    );
    const options = { key: 'unit-test', hashFn: 999 };

    // Act
    const decoratorFactory = RemoveCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });

  it("should throw an exception if the options 'hasFn' property is defined and not a function (boolean)", () => {
    // Arrange.
    const expectedResult = new Error(
      "Invalid RemoveCacheOptions: 'hashFn' is not type function",
    );
    const options = { key: 'unit-test', hashFn: true };

    // Act
    const decoratorFactory = RemoveCache.bind(null, options);

    //Assert.
    expect(decoratorFactory).toThrow(expectedResult);
  });
});
