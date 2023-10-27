import { AccessTokenService, ActiveUserData } from '@hermes/iam';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class IamAccessTokenService extends AccessTokenService {
  private readonly VERIFY_TOKEN_URL = this.configService.get(
    'VERIFY_ACCESS_TOKEN_URL',
  );

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async verify(token: string): Promise<ActiveUserData> {
    const request = this.httpService
      .post(this.VERIFY_TOKEN_URL, {
        query: `
        mutation {
          verifyAccessToken(token: "${token}")
        }
      `,
      })
      .pipe(map(({ data: payload }) => payload.data.verifyAccessToken));

    return firstValueFrom(request);
  }
}