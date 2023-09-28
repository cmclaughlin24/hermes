import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';

@Injectable()
export class AuthenticationService {
  constructor(private readonly usersService: UsersService) {}

  async signUp(signUpInput: SignUpInput) {
    return this.usersService.create(signUpInput);
  }

  async signIn(signInInput: SignInInput) {
    return null;
  }
}
