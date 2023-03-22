import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponseDto } from '@notification/common';
import _ from 'lodash';
import { SubscriptionFilter } from '../subscription/entities/subscription-filter.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from './dto/update-distribution-rule.dto';
import { DistributionRule } from './entities/distribution-rule.entity';

@Injectable()
export class DistributionRuleService {
  constructor(
    @InjectModel(DistributionRule)
    private readonly distributionRuleModel: typeof DistributionRule,
  ) {}

  async findAll(queues: string[]) {
    // Fixme: Configure DistributionRuleModule findAll options.
    const distributionRules = await this.distributionRuleModel.findAll();

    if (_.isEmpty(distributionRules)) {
      throw new NotFoundException(`Distribution rules not found!`);
    }

    return distributionRules;
  }

  async findOne(
    queue: string,
    messageType: string,
    includeSubscriptions: boolean = false,
  ) {
    const distributionRule = await this.distributionRuleModel.findOne({
      where: { queue, messageType },
      include: includeSubscriptions
        ? [{ model: Subscription, include: [SubscriptionFilter] }]
        : [],
    });

    if (!distributionRule) {
      throw new NotFoundException(
        `Distribution Rule for queue=${queue} messageType=${messageType} not found!`,
      );
    }

    return distributionRule;
  }

  async create(createDistributionRuleDto: CreateDistributionRuleDto) {
    const existingRule = await this.distributionRuleModel.findOne({
      where: {
        queue: createDistributionRuleDto.queue,
        messageType: createDistributionRuleDto.messageType,
      },
    });

    if (existingRule) {
      throw new BadRequestException(
        `Distribution Rule for queue=${createDistributionRuleDto.queue} messageType=${createDistributionRuleDto.messageType} already exists!`,
      );
    }

    const distributionRule = await this.distributionRuleModel.create({
      ...createDistributionRuleDto,
    });

    return new ApiResponseDto<DistributionRule>(
      `Successfully created distribution rule for queue=${distributionRule.queue} messageType=${distributionRule.messageType}!`,
      distributionRule,
    );
  }

  async update(
    queue: string,
    messageType: string,
    updateDistributionRuleDto: UpdateDistributionRuleDto,
  ) {
    let distributionRule = await this.distributionRuleModel.findOne({
      where: { queue, messageType },
    });

    if (!distributionRule) {
      throw new NotFoundException(
        `Distribution Rule for queue=${queue} messageType=${messageType} not found!`,
      );
    }

    // Fixme: Update distribution rule.

    return new ApiResponseDto<DistributionRule>(
      `Successfully updated distribution rule for queue=${distributionRule.queue} messageType=${distributionRule.messageType}!`,
      distributionRule,
    );
  }

  async remove(queue: string, messageType: string) {
    const distributionRule = await this.distributionRuleModel.findOne({
      where: { queue, messageType },
    });

    if (!distributionRule) {
      throw new NotFoundException(
        `Distribution Rule for queue=${queue} messageType=${messageType} not found!`,
      );
    }

    await distributionRule.destroy();

    return new ApiResponseDto(
      `Successfully deleted distribution rule for queue=${queue} messageType=${messageType}!`,
    );
  }
}
