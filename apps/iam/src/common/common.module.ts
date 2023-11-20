import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BcryptService } from './services/bcrypt.service';
import { HashingService } from './services/hashing.service';
import { VerifyTokenService } from './services/verify-token.service';

@Module({
  imports: [JwtModule],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    VerifyTokenService,
  ],
  exports: [HashingService, VerifyTokenService],
})
export class CommonModule {}
