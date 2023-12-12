import { MissingException } from '@hermes/common';
import { ActiveEntityData, packPermissions } from '@hermes/iam';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
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

  /**
   * Yields true if the sign up was successful or false otherwise.
   * @param {SignUpInput} signUpInput
   * @returns {Promise<boolean>}
   */
  async signUp(signUpInput: SignUpInput) {
    const user = await this.userService.create(signUpInput);
    return !!user;
  }

  /**
   * Yields a tuple containing the access and refresh tokens. Throws
   * a `MissingException` if the user does not exist or an `InvalidPasswordException`
   * if the password is incorrect.
   * @param {SignInInput} signInInput
   * @returns {Promise<[string, string]>}
   */
  async signIn(signInInput: SignInInput) {
    const user = await this.userService.findByEmail(signInInput.email, true);

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

  /**
   * Yields an `ActiveEntityData` or throws an `InvalidTokenException` if the token
   * is invalid.
   * @param {string} token
   * @returns {Promise<ActiveEntityData>}
   */
  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<ActiveEntityData>(
        token,
        {
          secret: this.jwtSecret,
          audience: this.jwtAudience,
          issuer: this.jwtIssuer,
        },
      );

      return payload;
    } catch (error) {
      throw new InvalidTokenException();
    }
  }

  /**
   * Yields a tuple containing the access and refresh tokens or throws an
   * `InvalidTokenException` it the token is invalid.
   *
   * Note: A token is invalidated when it is redeemed for the first time
   *       (replay attack) or if an attempt to redeem an previously used token
   *       is made (revoke token family). This is known as Refresh Token Rotation.
   *
   * @param {string} refreshToken
   * @returns {Promise<[string, string]>}
   */
  async refreshToken(refreshToken: string) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveEntityData, 'sub'> & { refreshTokenId: string }
      >(refreshToken, {
        secret: this.jwtSecret,
        audience: this.jwtAudience,
        issuer: this.jwtIssuer,
      });
      const user = await this.userService.findById(sub);
      const isValid = await this.refreshTokenStorage
        .validate(user.id, refreshTokenId)
        .finally(async () => {
          await this.refreshTokenStorage.remove(user.id);
        });

      if (!isValid) {
        throw new InvalidTokenException();
      }

      return this._generateTokens(user);
    } catch (error) {
      throw new InvalidTokenException();
    }
  }

  /**
   * Yields a tuple containing the access and refresh tokens.
   * @param {User} user
   * @returns {Promise<[string, string]>}
   */
  private async _generateTokens(user: User): Promise<[string, string]> {
    const refreshTokenId = randomUUID();
    const permissions = packPermissions<string>(user.permissions);

    // Fixme: Send additional user information to be used in payload.
    const [accessToken, refreshToken] = await Promise.all([
      this._signToken<Partial<ActiveEntityData>>(user.id, this.accessTokenTtl, {
        name: user.name,
        authorization_details: permissions,
      }),
      this._signToken<{ refreshTokenId: string }>(
        user.id,
        this.refreshTokenTtl,
        { refreshTokenId },
      ),
    ]);

    // Note: Insert refresh token into cache storage so it may be invalidated
    //       after one usage to prevent a replay attack. (Refresh Token Rotation)
    await this.refreshTokenStorage.insert(user.id, refreshTokenId);

    return [accessToken, refreshToken];
  }

  /**
   * Yields a JSON Web Token (JWT).
   * @param {string} userId
   * @param {number} expiresIn
   * @param {T} payload
   * @returns {Promise<string>}
   */
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
