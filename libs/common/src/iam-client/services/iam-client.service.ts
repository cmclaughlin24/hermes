import { ActiveUserData, TokenService } from '@hermes/iam';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class IamClientService extends TokenService {
  private readonly VERIFY_TOKEN_URL = this.configService.get(
    'VERIFY_ACCESS_TOKEN_URL',
  );

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async verifyAccessToken(token: string): Promise<ActiveUserData> {
    const request = this.httpService
      .post(this.VERIFY_TOKEN_URL, {
        query: `
        mutation {
          verifyAccessToken(token: "${token}") {
            sub
          }
        }
      `,
      })
      .pipe(map(({ data: payload }) => payload.data.verifyAccessToken));

    return firstValueFrom(request);
  }
}
