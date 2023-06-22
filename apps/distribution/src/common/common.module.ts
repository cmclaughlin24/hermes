import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DistributionEventModule } from '../resources/distribution-event/distribution-event.module';
import { DistributionEventExistsRule } from './decorators/distribution-event-exists.decorator';
import { SubscriptionDataService } from './providers/subscription-data/subscription-data.service';

@Module({
  imports: [HttpModule, DistributionEventModule],
  providers: [DistributionEventExistsRule, SubscriptionDataService],
  exports: [SubscriptionDataService],
})
export class CommonModule {}
