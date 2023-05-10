import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DistributionEventModule } from '../resources/distribution-event/distribution-event.module';
import { DistributionEventExistsRule } from './decorators/distribution-event-exists.decorator';
import { SubscriptionMemberService } from './providers/subscription-member/subscription-member.service';

@Module({
  imports: [HttpModule, DistributionEventModule],
  providers: [DistributionEventExistsRule, SubscriptionMemberService],
  exports: [SubscriptionMemberService],
})
export class CommonModule {}
