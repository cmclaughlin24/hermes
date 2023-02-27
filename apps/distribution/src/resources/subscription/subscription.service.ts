import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription) private readonly subscription: Subscription,
  ) {}

  findAll() {}

  findOne(id: string) {}

  create(createSubscriptionDto: CreateSubscriptionDto) {}

  update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {}

  remove(id: string) {}
}
