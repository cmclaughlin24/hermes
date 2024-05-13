import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { cacheFactory } from '../config/cache.config';
import { BcryptService } from './services/bcrypt.service';
import { HashingService } from './services/hashing.service';
import { TokenStorage } from './storage/token.storage';

@Module({
  imports: [
    JwtModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: cacheFactory,
    }),
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    TokenStorage,
  ],
  exports: [HashingService, TokenStorage],
})
export class CommonModule {}
