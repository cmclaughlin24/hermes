import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from '../../common/common.module';
import { UserModule } from '../user/user.module';
import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [JwtModule, UserModule, CommonModule, ConfigModule],
  providers: [AuthenticationResolver, AuthenticationService],
})
export class AuthenticationModule {}
