import { ActiveUserData } from '../types/active-user.type';

export abstract class TokenService {
  abstract verifyAccessToken(token: string): Promise<ActiveUserData>;
}
