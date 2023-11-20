import { GqlExecutionContext } from '@nestjs/graphql';
import { getRequest } from './iam.utils';

jest.mock('@nestjs/graphql');

describe('iam.utils.ts', () => {
  describe('getRequest()', () => {
    it('should yield the request (http)', () => {
      // Arrange.
      const expectedResult = {};
      const context = {
        getType: () => 'http',
        switchToHttp: jest.fn(() => ({
          getRequest: () => expectedResult,
        })),
      };

      // Act.
      const result = getRequest(context as any);

      // Assert.
      expect(result).toEqual(expectedResult);
    });

    it('should yield the request (graphql)', () => {
      // Arrange.
      const expectedResult = {};
      const context = {
        getType: () => 'graphql',
        getContext: jest.fn(() => ({
          req: expectedResult,
        })),
      };
      // @ts-ignore
      GqlExecutionContext.create.mockReturnValue(context)

      // Act.
      const result = getRequest(context as any);

      // Assert.
      expect(result).toEqual(expectedResult);
    });
  });
});
