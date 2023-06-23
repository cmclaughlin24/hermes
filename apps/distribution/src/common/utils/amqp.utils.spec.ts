import { getAttempts } from './amqp.utils';

describe('amqp.utils.ts', () => {
  describe('getAttempts()', () => {
    it('should yield a number representing the attempts to process a message (first attempt)', () => {
      // Arrange.
      const expectedResult = 1;
      const queue = 'unit-test';
      const amqpMsg = {
        properties: {
          headers: {},
        },
      };

      // Act.
      const result = getAttempts(amqpMsg, queue);

      // Assert.
      expect(result).toBe(expectedResult);
    });

    it('should yield a number representing the attempts to process a message (n+1 attempt)', () => {
      // Arrange.
      const expectedResult = 4;
      const queue = 'unit-test';
      const amqpMsg = {
        properties: {
          headers: {
            'x-death': [
              {
                queue,
                count: expectedResult - 1,
              },
            ],
          },
        },
      };

      // Act.
      const result = getAttempts(amqpMsg, queue);

      // Assert.
      expect(result).toBe(expectedResult);
    });
  });
});
