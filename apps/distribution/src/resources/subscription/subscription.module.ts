import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SubscriptionFilter } from './entities/subscription-filter.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [SequelizeModule.forFeature([Subscription, SubscriptionFilter])],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SequelizeModule],
})
export class SubscriptionModule {}
