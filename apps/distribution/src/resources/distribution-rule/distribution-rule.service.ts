import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiResponseDto } from '@notification/common';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from './dto/update-distribution-rule.dto';
import { DistributionRule } from './entities/distribution-rule.entity';

@Injectable()
export class DistributionRuleService {
  constructor(
    @InjectModel(DistributionRule)
    private readonly distributionRuleModel: typeof DistributionRule,
  ) {}

  /**
   * Yields a list of DistributionRules or throws a NotFoundException if
   * the repository returns null, undefined, or an empty list.
   * @param {string[]} queues
   * @returns {Promise<DistributionRule[]>}
   */
  async findAll(queues: string[]) {
    const distributionRules = await this.distributionRuleModel.findAll({
      where: _.isEmpty(queues)
        ? {}
        : {
            queue: {
              [Op.or]: queues,
            },
          },
    });

    if (_.isEmpty(distributionRules)) {
      throw new NotFoundException(`Distribution rules not found!`);
    }

    return distributionRules;
  }

  /**
   * Yields a DistributionRule or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} id
   * @returns
   */
  async findOne(id: string) {
    const distributionRule = await this.distributionRuleModel.findByPk(id);

    if (!distributionRule) {
      throw new NotFoundException(`Distribution Rule for id=${id} not found!`);
    }

    return distributionRule;
  }

  /**
   * Creates a DistributionRule or throws a BadRequestException if a distribution rule
   * for a queue and messageType exist in the repository.
   * @param {CreateDistributionRuleDto} createDistributionRuleDto
   * @returns {Promise<ApiResponseDto<DistributionRule>>}
   */
  async create(createDistributionRuleDto: CreateDistributionRuleDto) {
    // const existingRule = await this.distributionRuleModel.findOne({
    //   where: {
    //     queue: createDistributionRuleDto.queue,
    //     messageType: createDistributionRuleDto.messageType,
    //   },
    // });

    // if (existingRule) {
    //   throw new BadRequestException(
    //     `Distribution Rule for queue=${createDistributionRuleDto.queue} messageType=${createDistributionRuleDto.messageType} already exists!`,
    //   );
    // }

    const distributionRule = await this.distributionRuleModel.create({
      ...createDistributionRuleDto,
    });

    return new ApiResponseDto<DistributionRule>(
      `Successfully created distribution rule for queue=!`,
      distributionRule,
    );
  }

  /**
   * Updates a DistributionRule or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} queue
   * @param {string} messageType
   * @param {UpdateDistributionRuleDto} updateDistributionRuleDto
   * @returns {Promise<ApiResponseDto<DistributionRule>>}
   */
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

    distributionRule = await distributionRule.update({
      deliveryMethods:
        updateDistributionRuleDto.deliveryMethods ??
        distributionRule.deliveryMethods,
      emailSubject:
        updateDistributionRuleDto.emailSubject ?? distributionRule.emailSubject,
      emailTemplate:
        updateDistributionRuleDto.emailTemplate ??
        distributionRule.emailTemplate,
      html: updateDistributionRuleDto.html ?? distributionRule.html,
      text: updateDistributionRuleDto.text ?? distributionRule.text,
      checkDeliveryWindow:
        updateDistributionRuleDto.checkDeliveryWindow ??
        distributionRule.checkDeliveryWindow,
    });

    return new ApiResponseDto<DistributionRule>(
      `Successfully updated distribution rule for queue=!`,
      distributionRule,
    );
  }

  /**
   * Removes a DistributionRule or throws a NotFoundFoundException if the repository
   * returns null or undefined.
   * @param {string} queue
   * @param {string} messageType
   * @returns {Promise<ApiResponseDto>}
   */
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
