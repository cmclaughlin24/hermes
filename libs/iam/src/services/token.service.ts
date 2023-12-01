import { ActiveEntityData } from '../types/active-entity-data.type';

export abstract class TokenService {
  /**
   * Yields an `ActiveEntityData` object if an access token is valid.
   * @param {string} token
   * @returns {Promise<ActiveEntityData>}
   */
  verifyAccessToken?(token: string): Promise<ActiveEntityData>;

  /**
   * Yields an `ActiveEntityData` object if an api key is valid.
   * @param {string} apiKey
   * @returns {Promise<ActiveEntityData>}
   */
  verifyApiKey?(apiKey: string): Promise<ActiveEntityData>;
}
