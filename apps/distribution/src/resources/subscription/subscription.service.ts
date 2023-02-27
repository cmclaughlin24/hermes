import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor() {}

  findAll() {}

  findOne(id: string) {}

  create(createSubscriptionDto: CreateSubscriptionDto) {}

  update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {}

  remove(id: string) {}
}
