import { ActiveEntityData } from '../types/active-entity-data.type';

export abstract class TokenService {
  /**
   * Yields an `ActiveEntityData` object.
   * @param {string} token
   * @returns {Promise<ActiveEntityData>}
   */
  abstract verifyAccessToken(token: string): Promise<ActiveEntityData>;
}
