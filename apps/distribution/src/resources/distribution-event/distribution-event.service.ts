import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';
import { DistributionEvent } from './entities/distribution-event.entity';

@Injectable()
export class DistributionEventService {
  constructor(
    @InjectModel(DistributionEvent)
    private readonly distributionEventModel: typeof DistributionEvent,
  ) {}

  findAll() {}

  findOne(
    queue: string,
    messageType: string,
    includeRules: boolean = false,
    includeSubscriptions: boolean = false,
  ) {}

  create(createDistributionEventDto: CreateDistributionEventDto) {}

  update(
    queue: string,
    messageType: string,
    updateDistributionEventDto: UpdateDistributionEventDto,
  ) {}

  remove(queue: string, messageType: string) {}
}
