import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionEventModule } from '../distribution-event/distribution-event.module';
import { SubscriptionFilter } from './entities/subscription-filter.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Subscription, SubscriptionFilter]),
    DistributionEventModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
