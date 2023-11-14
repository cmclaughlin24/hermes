import { MissingException } from '@hermes/common';
import { ActiveUserData } from '@hermes/iam';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from '../../common/services/hashing.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';
import { InvalidPasswordException } from './errors/invalid-password.exception';
import { InvalidTokenException } from './errors/invalid-token.exception';
import { RefreshTokenStorage } from './refresh-token.storage';

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
    private readonly refreshTokenStorage: RefreshTokenStorage,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpInput: SignUpInput) {
    const user = await this.userService.create(signUpInput);
    return !!user;
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
      throw new InvalidPasswordException();
    }

    return this._generateTokens(user);
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<ActiveUserData>(token, {
        secret: this.jwtSecret,
        audience: this.jwtAudience,
        issuer: this.jwtIssuer,
      });

      return payload;
    } catch (error) {
      throw new InvalidTokenException();
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshToken, {
        secret: this.jwtSecret,
        audience: this.jwtAudience,
        issuer: this.jwtIssuer,
      });
      const user = await this.userService.findById(sub);

      return this._generateTokens(user);
    } catch (error) {
      throw new InvalidTokenException();
    }
  }

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
