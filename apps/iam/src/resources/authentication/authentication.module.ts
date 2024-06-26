import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from '../../common/common.module';
import { UserModule } from '../user/user.module';
import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    UserModule,
  ],
  providers: [
    AuthenticationResolver,
    AuthenticationService,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
