import { compileTextTemplate } from './template.utils';

describe('template.utils.ts', () => {
  describe('compileTextTemplate()', () => {
    const text = '{{ key.key }}';

    it('should yield a string when no key patterns are present', () => {
      // Arrange.
      const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

      // Act.
      const result = compileTextTemplate(text, null);

      // Assert.
      expect(result).toBe(text);
    });

    it('should yield a string where the key patterns have been replaced with values from the data argument', () => {
      // Arrange.
      const text =
        'Lorem ipsum dolor {{hello}} amet, consectetur adipiscing {{world.value}}.';
      const data = { hello: 'veniam', world: { value: 'dolore' } };
      const expectedText = `Lorem ipsum dolor ${data.hello} amet, consectetur adipiscing ${data.world.value}.`;

      // Act.
      const result = compileTextTemplate(text, data);

      // Assert.
      expect(result).toBe(expectedText);
    });

    it('should throw an error if the data is null/undefined if the key pattern is present', () => {
      // Arrange.
      const expectedError = new Error(
        'Invalid Argument: data cannot be null/undefined if the key pattern is present',
      );

      // Act.
      const func = compileTextTemplate.bind(null, text, null);

      // Assert.
      expect(func).toThrow(expectedError);
    });

    it('should throw an error if the data is not an object (string)', () => {
      // Arrange.
      const data = 'test';
      const expectedError = new Error(
        `Invalid Argument: data must be type 'object', recieved ${typeof data}`,
      );

      // Act.
      const func = compileTextTemplate.bind(null, text, data);

      // Assert.
      expect(func).toThrow(expectedError);
    });

    it('should throw an error if the data is not an object (number)', () => {
      // Arrange.
      const data = 1;
      const expectedError = new Error(
        `Invalid Argument: data must be type 'object', recieved ${typeof data}`,
      );

      // Act.
      const func = compileTextTemplate.bind(null, text, data);

      // Assert.
      expect(func).toThrow(expectedError);
    });

    it('should throw an error if the data is not an object (boolean)', () => {
      // Arrange.
      const data = true;
      const expectedError = new Error(
        `Invalid Argument: data must be type 'object', recieved ${typeof data}`,
      );

      // Act.
      const func = compileTextTemplate.bind(null, text, data);

      // Assert.
      expect(func).toThrow(expectedError);
    });

    it('should throw an error if the data is an array', () => {
      // Arrange.
      const data = [];
      const expectedError = new Error(
        "Invalid Argument: data must be type 'object', recieved array",
      );

      // Act.
      const func = compileTextTemplate.bind(null, text, data);

      // Assert.
      expect(func).toThrow(expectedError);
    });
  });
});
