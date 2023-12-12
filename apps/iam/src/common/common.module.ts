import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BcryptService } from './services/bcrypt.service';
import { HashingService } from './services/hashing.service';

@Module({
  imports: [JwtModule],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
  exports: [HashingService],
})
export class CommonModule {}
