import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from '../../common/common.module';
import { cacheFactory } from '../../config/cache.config';
import { UserModule } from '../user/user.module';
import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationService } from './authentication.service';
import { TokenStorage } from './token.storage';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheFactory,
    }),
    UserModule,
  ],
  providers: [
    AuthenticationResolver,
    AuthenticationService,
    TokenStorage,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
