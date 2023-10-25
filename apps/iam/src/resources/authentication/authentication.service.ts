import { MissingException } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from '../../common/services/hashing.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';

@Injectable()
export class AuthenticationService {
  private readonly jwtSecret = this.configService.get('JWT_SECRET');
  private readonly jwtAudience = this.configService.get('JWT_TOKEN_AUDIENCE');
  private readonly jwtIssuer = this.configService.get('JWT_TOKEN_ISSUER');
  private readonly accessTokenTtl = this.configService.get(
    'JWT_ACCESS_TOKEN_TTL',
  );
  private readonly refreshTokenTtl = this.configService.get(
    'JWT_REFRESH_TOKEN_TTL',
  );

  constructor(
    private readonly userService: UserService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpInput: SignUpInput) {
    const user = await this.userService.create(signUpInput);
  }

  async signIn(signInInput: SignInInput) {
    const user = await this.userService.findByEmail(signInInput.email);

    if (!user) {
      throw new MissingException(
        `User with email=${signInInput.email} not found!`,
      );
    }

    const isValidPassword = await this.hashingService.compare(
      signInInput.password,
      user.password,
    );

    if (!isValidPassword) {
      // Fixme: Throw a custom exception for invalid password.
    }

    return this._generateTokens(user);
  }

  async verifyToken(token: string) {}

  private async _generateTokens(user: User) {
    // Fixme: Send additional user information to be used in payload.
    const [accessToken, refreshToken] = await Promise.all([
      this._signToken<{}>(user.id, this.accessTokenTtl, {}),
      this._signToken<{}>(user.id, this.refreshTokenTtl, {}),
    ]);

    // Fixme: Store the refresh token so that it can be validated.

    return [accessToken, refreshToken];
  }

  private async _signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtAudience,
        issuer: this.jwtIssuer,
        secret: this.jwtSecret,
        expiresIn,
      },
    );
  }
}
