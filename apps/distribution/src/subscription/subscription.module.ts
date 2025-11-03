import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionEventModule } from '../distribution-event/distribution-event.module';
import { SubscriptionFilterEntity } from './repository/entities/subscription-filter.entity';
import { SubscriptionEntity } from './repository/entities/subscription.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRepository } from './repository/subscription.repository';
import { OrmSubscriptionRepository } from './repository/orm-subscription.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionEntity, SubscriptionFilterEntity]),
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
