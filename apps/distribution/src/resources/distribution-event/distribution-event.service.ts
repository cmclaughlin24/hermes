import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponseDto } from '@notification/common';
import * as _ from 'lodash';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';
import { DistributionEvent } from './entities/distribution-event.entity';

@Injectable()
export class DistributionEventService {
  constructor(
    @InjectModel(DistributionEvent)
    private readonly distributionEventModel: typeof DistributionEvent,
  ) {}

  async findAll(includeRules: boolean, includeSubscriptions: boolean) {
    const distributionEvents = await this.distributionEventModel.findAll();

    if (_.isEmpty(distributionEvents)) {
      throw new NotFoundException('Distribution events not found!');
    }

    return distributionEvents;
  }

  async findOne(
    queue: string,
    messageType: string,
    includeRules: boolean = false,
    includeSubscriptions: boolean = false,
  ) {
    const distributionEvent = await this.distributionEventModel.findOne({
      where: { queue, messageType },
    });

    if (!distributionEvent) {
      throw new NotFoundException(
        `Distribution Event for queue=${queue} messageType=${messageType} not found!`,
      );
    }

    return distributionEvent;
  }

  async create(createDistributionEventDto: CreateDistributionEventDto) {
    const existingEvent = await this.distributionEventModel.findOne({
      where: {
        queue: createDistributionEventDto.queue,
        messageType: createDistributionEventDto.messageType,
      },
    });

    if (existingEvent) {
      throw new BadRequestException(
        `Distribution Event for queue=${createDistributionEventDto.queue} messageType=${createDistributionEventDto.messageType} already exists!`,
      );
    }

    const distributionEvent = await this.distributionEventModel.create({
      ...createDistributionEventDto,
    });

    return new ApiResponseDto<DistributionEvent>(
      `Successfully created distribution rule for queue=${distributionEvent.queue} messageType=${distributionEvent.messageType}!`,
      distributionEvent,
    );
  }

  async update(
    queue: string,
    messageType: string,
    updateDistributionEventDto: UpdateDistributionEventDto,
  ) {
    const distributionEvent = await this.distributionEventModel.findOne({
      where: { queue, messageType },
    });

    if (!distributionEvent) {
      throw new NotFoundException(
        `Distribution Event for queue=${queue} messageType=${messageType} not found!`,
      );
    }
  }

  async remove(queue: string, messageType: string) {
    const distributionEvent = await this.distributionEventModel.findOne({
      where: { queue, messageType },
    });

    if (!distributionEvent) {
      throw new NotFoundException(
        `Distribution Event for queue=${queue} messageType=${messageType} not found!`,
      );
    }

    await distributionEvent.destroy();

    return new ApiResponseDto(
      `Successfully deleted distribution event for queue=${queue} messageType=${messageType}!`,
    );
  }
}
