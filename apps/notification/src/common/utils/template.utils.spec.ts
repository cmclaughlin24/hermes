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

    it('should yield a string where the key patterns have been replaced with values from the context argument', () => {
      // Arrange.
      const text =
        'Lorem ipsum dolor {{hello}} amet, consectetur adipiscing {{world.value}}.';
      const context = { hello: 'veniam', world: { value: 'dolore' } };
      const expectedText = `Lorem ipsum dolor ${context.hello} amet, consectetur adipiscing ${context.world.value}.`;

      // Act.
      const result = compileTextTemplate(text, context);

      // Assert.
      expect(result).toBe(expectedText);
    });

    it('should throw an error if the context is null/undefined if the key pattern is present', () => {
      // Arrange.
      const expectedError = new Error(
        'Invalid Argument: context cannot be null/undefined if the key pattern is present',
      );

      // Act.
      const func = compileTextTemplate.bind(null, text, null);

      // Assert.
      expect(func).toThrow(expectedError);
    });

    it('should throw an error if the context is not an object (string)', () => {
      // Arrange.
      const context = 'test';
      const expectedError = new Error(
        `Invalid Argument: context must be type 'object', recieved ${typeof context}`,
      );

      // Act.
      const func = compileTextTemplate.bind(null, text, context);

      // Assert.
      expect(func).toThrow(expectedError);
    });

    it('should throw an error if the context is not an object (number)', () => {
      // Arrange.
      const context = 1;
      const expectedError = new Error(
        `Invalid Argument: context must be type 'object', recieved ${typeof context}`,
      );

      // Act.
      const func = compileTextTemplate.bind(null, text, context);

      // Assert.
      expect(func).toThrow(expectedError);
    });

    it('should throw an error if the context is not an object (boolean)', () => {
      // Arrange.
      const context = true;
      const expectedError = new Error(
        `Invalid Argument: context must be type 'object', recieved ${typeof context}`,
      );

      // Act.
      const func = compileTextTemplate.bind(null, text, context);

      // Assert.
      expect(func).toThrow(expectedError);
    });

    it('should throw an error if the context is an array', () => {
      // Arrange.
      const context = [];
      const expectedError = new Error(
        "Invalid Argument: context must be type 'object', recieved array",
      );

      // Act.
      const func = compileTextTemplate.bind(null, text, context);

      // Assert.
      expect(func).toThrow(expectedError);
    });
  });
});
