import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IamClientService } from './services/iam-client.service';

@Module({
  imports: [HttpModule],
  providers: [IamClientService],
  exports: [IamClientService],
})
export class IamClientModule {}
