import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DistributionEventModule } from '../resources/distribution-event/distribution-event.module';
import { DistributionEventExistsRule } from './decorators/distribution-event-exists.decorator';
import { SubscriberService } from './services/subscriber/subscriber.service';

@Module({
  imports: [HttpModule, DistributionEventModule],
  providers: [DistributionEventExistsRule, SubscriberService],
  exports: [SubscriberService],
})
export class CommonModule {}
