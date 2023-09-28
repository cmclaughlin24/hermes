import { Module } from '@nestjs/common';
import { HashingService } from './providers/hashing.service';

@Module({
  providers: [HashingService]
})
export class CommonModule {}
