import { Resolver } from '@nestjs/graphql';
import { AuthenticationService } from './authentication.service';

@Resolver()
export class AuthenticationResolver {
  constructor(private readonly authenticationService: AuthenticationService) {}
}
