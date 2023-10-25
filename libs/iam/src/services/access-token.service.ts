import { ActiveUserData } from '../types/active-user.type';

export abstract class AccessTokenService {
  abstract verify(token: string): Promise<ActiveUserData>;
}
