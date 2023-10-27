import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IamAccessTokenService } from './services/iam-access-token.service';

@Module({
  imports: [HttpModule],
  providers: [IamAccessTokenService],
  exports: [IamAccessTokenService],
})
export class IamClientModule {}
