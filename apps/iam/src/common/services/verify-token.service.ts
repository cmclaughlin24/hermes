import { ActiveEntityData, TokenService } from '@hermes/iam';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class VerifyTokenService extends TokenService {
  private readonly jwtSecret = this.configService.get('JWT_SECRET');
  private readonly jwtAudience = this.configService.get('JWT_TOKEN_AUDIENCE');
  private readonly jwtIssuer = this.configService.get('JWT_TOKEN_ISSUER');

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  verifyAccessToken(token: string): Promise<ActiveEntityData> {
    return this.jwtService.verifyAsync<ActiveEntityData>(token, {
      secret: this.jwtSecret,
      audience: this.jwtAudience,
      issuer: this.jwtIssuer,
    });
  }
}
