import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { IAM_ENTITY_KEY } from '../constants/iam.constants';
import { TokenService } from '../services/token.service';
import { getRequest } from '../utils/iam.utils';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = getRequest(context);
    const token = this._extractToken(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.tokenService.verifyAccessToken(token, request);

      request[IAM_ENTITY_KEY] = payload;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private _extractToken(request: Request): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
