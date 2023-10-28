import { ActiveUserData } from '../types/active-user.type';

export abstract class AccessTokenService {
  abstract verifyAccessToken(token: string): Promise<ActiveUserData>;
}
