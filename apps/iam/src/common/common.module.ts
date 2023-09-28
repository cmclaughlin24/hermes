import { Module } from '@nestjs/common';
import { BcryptService } from './services/bcrypt.service';
import { HashingService } from './services/hashing.service';

@Module({
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
  exports: [HashingService],
})
export class CommonModule {}
