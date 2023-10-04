import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { UserModule } from '../user/user.module';
import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [UserModule, CommonModule],
  providers: [AuthenticationResolver, AuthenticationService],
})
export class AuthenticationModule {}
