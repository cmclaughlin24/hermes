import { hasSelectors } from './metadata.utils';

describe('metadata.utils.ts', () => {
  describe('hasSelectors()', () => {
    it("should yield true if every label selector's value matches in the metadata and values arguments", () => {
      // Arrange.
      const labels = ['languageCode', 'region'];
      const metadata = {
        languageCode: 'en-US',
        region: 'North America',
      };
      const values = {
        languageCode: 'en-US',
        region: 'North America',
        timeZone: 'America/Central',
      };

      // Act.
      const result = hasSelectors(labels, metadata, values);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if the metadata and value arguments are both null/undefined', () => {
      // Arrange.
      const labels = ['languageCode', 'region'];

      // Act.
      const result = hasSelectors(labels, null, null);

      // Assert.
      expect(result).toBeTruthy();
    });

    it("should yield false if every label selector's value does not match in the metadata and values arguments", () => {
      // Arrange.
      const labels = ['languageCode', 'region'];
      const metadata = {
        languageCode: 'en-US',
        region: 'North America',
      };
      const values = {
        languageCode: 'es-MX',
        region: 'North America',
        timeZone: 'America/Central',
      };

      // Act.
      const result = hasSelectors(labels, metadata, values);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should yield false if the metadata argument is defined and the values argument is null/undefined', () => {
      // Arrange.
      const labels = ['languageCode', 'region'];
      const metadata = {
        languageCode: 'en-US',
        region: 'North America',
      };

      // Act.
      const result = hasSelectors(labels, metadata, null);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should yield false if the metadata argument is null/undefined and the values argument is defined', () => {
      // Arrange.
      const labels = ['languageCode', 'region'];
      const values = {
        languageCode: 'es-MX',
        region: 'North America',
        timeZone: 'America/Central',
      };

      // Act.
      const result = hasSelectors(labels, null, values);

      // Assert.
      expect(result).toBeFalsy();
    });
  });
});
