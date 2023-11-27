import { ActiveEntity } from '../types/active-entity.type';

export abstract class TokenService {
  /**
   * Yields an `ActiveEntity` object.
   * @param {string} token
   * @returns {Promise<ActiveEntity>}
   */
  abstract verifyAccessToken(token: string): Promise<ActiveEntity>;
}
