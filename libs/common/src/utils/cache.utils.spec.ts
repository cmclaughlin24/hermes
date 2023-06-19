import { defaultHashFn } from './cache.utils';

describe('cache.utils.ts', () => {
  describe('defaultHashFn()', () => {
    it('should yield a unique key hash', () => {
      // Arrange.
      const key = 'unit-test';
      const args = ['testing', 1, { name: 'John Doe' }];
      const expectedResult = `${key}::${args
        .map((arg) => JSON.stringify(arg))
        .join(',')}`;

      // Act.
      const result = defaultHashFn(key, args);

      // Assert.
      expect(result).toBe(expectedResult);
    });

    it('should yield a unique key hash (args null/undefined)', () => {
      // Arrange.
      const key = 'unit-test';

      // Act.
      const result = defaultHashFn(key, null);

      // Assert.
      expect(result).toBe(key);
    });

    it('should yield a unique key hash (args empty list)', () => {
      // Arrange.
      const key = 'unit-test';

      // Act.
      const result = defaultHashFn(key, []);

      // Assert.
      expect(result).toBe(key);
    });
  });
});
