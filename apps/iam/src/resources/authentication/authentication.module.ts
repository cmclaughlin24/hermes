import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [UsersModule],
  providers: [AuthenticationResolver, AuthenticationService],
})
export class AuthenticationModule {}
