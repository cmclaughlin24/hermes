import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponseDto, DistributionQueues } from '@notification/common';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from './dto/update-distribution-rule.dto';
import { DistributionRule } from './entities/distribution-rule.entity';

@Injectable()
export class DistributionRuleService {
  constructor(
    @InjectModel(DistributionRule)
    private readonly distributionRuleModel: typeof DistributionRule,
  ) {}

  async findAll(queues: DistributionQueues[]) {
    // Fixme: Configure DistributionRuleModule findAll options.
    const distributionRules = await this.distributionRuleModel.findAll();

    if (!distributionRules || distributionRules.length === 0) {
      throw new NotFoundException(`Distribution rules not found!`);
    }

    return distributionRules;
  }

  async findOne(
    name: string,
    queue: DistributionQueues,
    includeSubscriptions: boolean = false,
  ) {
    // Fixme: Check if subscriptions should be included or not.
    const distributionRule = await this.distributionRuleModel.findOne({
      where: { name, queue },
    });

    if (!distributionRule) {
      throw new NotFoundException(`Distribution Rule with ${name} not found!`);
    }

    return distributionRule;
  }

  async create(createDistributionRuleDto: CreateDistributionRuleDto) {
    const existingRule = await this.distributionRuleModel.findOne({
      where: {
        name: createDistributionRuleDto.name,
        queue: createDistributionRuleDto.queue,
      },
    });

    if (existingRule) {
      throw new BadRequestException(
        `Distribution Rule ${createDistributionRuleDto.name} already exists!`,
      );
    }

    const distributionRule = await this.distributionRuleModel.create({
      ...createDistributionRuleDto,
    });

    return new ApiResponseDto<DistributionRule>(
      `Successfully created distribution rule ${distributionRule.name}!`,
      distributionRule,
    );
  }

  async update(
    name: string,
    queue: DistributionQueues,
    updateDistributionRuleDto: UpdateDistributionRuleDto,
  ) {
    let distributionRule = await this.distributionRuleModel.findOne({
      where: { name, queue },
    });

    if (!distributionRule) {
      throw new NotFoundException(`Distribution Rule with ${name} not found!`);
    }

    // Fixme: Update distribution rule.

    return new ApiResponseDto<DistributionRule>(
      `Successfully updated distribution rule ${distributionRule.name}!`,
      distributionRule,
    );
  }

  async remove(name: string, queue: DistributionQueues) {
    const distributionRule = await this.distributionRuleModel.findOne({
      where: { name, queue },
    });

    if (!distributionRule) {
      throw new NotFoundException(`Distribution Rule with ${name} not found!`);
    }

    await distributionRule.destroy();

    return new ApiResponseDto(
      `Successfully deleted distribution rule ${name}!`,
    );
  }
}
