import { errorToJson } from './error.utils';

describe('error.utils.ts', () => {
  describe('errorToJson()', () => {
    it('should yield a JSON representation of an "Error" object', () => {
      // Arrange.
      const error = new Error('The Xbox was the first gaming console to have an integrated hard drive as a standard feature.');
      const expectedResult = {};
      Object.getOwnPropertyNames(error).forEach(function (propName: string) {
        expectedResult[propName] = error[propName];
      });

      // Act.
      const result = errorToJson(error);

      // Assert.
      expect(result).toEqual(expectedResult);
    });

    it('should yield null if the argument is null/undefined', () => {
      // Act.
      const result = errorToJson(null);

      // Assert.
      expect(result).toBeNull();
    });

    it('should throw an error if the argument is not an "Error" object instance', () => {
      // Arrange.
      const expectedResult = new Error('Invalid Argument: expected instance of Error');

      // Act.
      const fn = errorToJson.bind(null, {});

      // Assert.
      expect(fn).toThrow(expectedResult);
    });
  });
});
