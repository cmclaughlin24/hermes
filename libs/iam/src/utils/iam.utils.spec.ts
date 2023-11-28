import { GqlExecutionContext } from '@nestjs/graphql';
import { getRequest, packPermissions, unpackPermissions } from './iam.utils';

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
      GqlExecutionContext.create.mockReturnValue(context);

      // Act.
      const result = getRequest(context as any);

      // Assert.
      expect(result).toEqual(expectedResult);
    });
  });

  describe('packPermissions()', () => {
    it('should yield a list of formatted permissions', () => {
      // Arrange.
      const permissions = [
        { resource: 'LegendOfZelda', action: 'RetrieveMasterSword' },
        { resource: 'SuperMario', action: 'SavePrincessPeach' },
        { resource: 'SuperMario', action: 'DefeatBowser' },
      ];
      const expectedResult = [
        'LegendOfZelda=RetrieveMasterSword',
        'SuperMario=SavePrincessPeach,DefeatBowser',
      ];

      // Act.
      const result = packPermissions(permissions);

      // Assert.
      expect(result).toEqual(expectedResult);
    });

    it('should yield an empty list if null/undefined is provided as the argument', () => {
      // Act.
      const result = packPermissions(null);

      // Assert.
      expect(result).toEqual([]);
    });

    it('should yield an empty list if an empty list is provided as the argument', () => {
      // Act.
      const result = packPermissions([]);

      // Assert.
      expect(result).toEqual([]);
    });
  });

  describe('unpackPermissions()', () => {
    it('should yield a permissions map', () => {
      // Arrange.
      const permissions = ['Metroid=FightRidley,KillMetroids'];
      const expectedResult = new Map<string, string[]>();
      expectedResult.set('Metroid', ['FightRidley', 'KillMetroids']);

      // Act.
      const result = unpackPermissions<string>(permissions);

      // Assert.
      expect(result).toEqual(expectedResult);
    });

    it('should yield an empty map if null/undefined is provided as the argument', () => {
      // Act.
      const result = unpackPermissions(null);

      // Assert.
      expect(result).toEqual(new Map());
    });

    it('should yield an empty if an empty list is provided as the argument', () => {
      // Act.
      const result = unpackPermissions([]);

      // Assert.
      expect(result).toEqual(new Map());
    });
  });
});
