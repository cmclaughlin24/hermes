import { MissingException } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from '../../common/services/hashing.service';
import { UserService } from '../user/user.service';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpInput: SignUpInput) {
    const user = await this.userService.create(signUpInput);

    // Fixme: Generate JWT and Refresh Tokens.
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

    // Fixme: Generate JWT and Refresh Tokens.
  }

  async verifyToken(token: string) {}

  private async _signToken<T>(userId: string, expiresIn: number, payload?: T) {}
}
