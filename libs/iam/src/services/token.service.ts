import { ActiveEntityData } from '../types/active-entity-data.type';

export abstract class TokenService {
  /**
   * Yields an `ActiveEntityData` object if an access token is valid.
   * @param {string} token
   * @param {any} req
   * @returns {Promise<ActiveEntityData>}
   */
  abstract verifyAccessToken?(
    token: string,
    req?: any,
  ): Promise<ActiveEntityData>;

  /**
   * Yields an `ActiveEntityData` object if an api key is valid.
   * @param {string} apiKey
   * @param {any} req
   * @returns {Promise<ActiveEntityData>}
   */
  abstract verifyApiKey?(apiKey: string, req?: any): Promise<ActiveEntityData>;
}
