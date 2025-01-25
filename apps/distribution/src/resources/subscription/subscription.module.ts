import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionEventModule } from '../distribution-event/distribution-event.module';
import { SubscriptionFilter } from './repository/entities/subscription-filter.entity';
import { Subscription } from './repository/entities/subscription.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRepository } from './repository/subscription.repository';
import { OrmSubscriptionRepository } from './repository/orm-subscription.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, SubscriptionFilter]),
    DistributionEventModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    {
      provide: SubscriptionRepository,
      useClass: OrmSubscriptionRepository,
    },
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
