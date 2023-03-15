import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponseDto } from '@notification/common';
import * as _ from 'lodash';
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

  async findOne(queue: string, event: string) {
    const distributionRule = await this.distributionRuleModel.findOne({
      where: { queue, event },
    });

    if (!distributionRule) {
      throw new NotFoundException(
        `Distribution Rule for queue=${queue} event=${event} not found!`,
      );
    }

    return distributionRule;
  }

  async create(createDistributionRuleDto: CreateDistributionRuleDto) {
    const existingRule = await this.distributionRuleModel.findOne({
      where: {
        queue: createDistributionRuleDto.queue,
        event: createDistributionRuleDto.event,
      },
    });

    if (existingRule) {
      throw new BadRequestException(
        `Distribution Rule for queue=${createDistributionRuleDto.queue} event=${createDistributionRuleDto.event} already exists!`,
      );
    }

    const distributionRule = await this.distributionRuleModel.create({
      ...createDistributionRuleDto,
    });

    return new ApiResponseDto<DistributionRule>(
      `Successfully created distribution rule for queue=${distributionRule.queue} event=${distributionRule.event}!`,
      distributionRule,
    );
  }

  async update(
    queue: string,
    event: string,
    updateDistributionRuleDto: UpdateDistributionRuleDto,
  ) {
    let distributionRule = await this.distributionRuleModel.findOne({
      where: { queue, event },
    });

    if (!distributionRule) {
      throw new NotFoundException(
        `Distribution Rule for queue=${queue} event=${event} not found!`,
      );
    }

    // Fixme: Update distribution rule.

    return new ApiResponseDto<DistributionRule>(
      `Successfully updated distribution rule for queue=${distributionRule.queue} event=${distributionRule.event}!`,
      distributionRule,
    );
  }

  async remove(queue: string, event: string) {
    const distributionRule = await this.distributionRuleModel.findOne({
      where: { queue, event },
    });

    if (!distributionRule) {
      throw new NotFoundException(
        `Distribution Rule for queue=${queue} event=${event} not found!`,
      );
    }

    await distributionRule.destroy();

    return new ApiResponseDto(
      `Successfully deleted distribution rule for queue=${queue} event=${event}!`,
    );
  }
}
