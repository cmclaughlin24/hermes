import { ApiResponseDto } from '@hermes/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { DistributionEventService } from '../distribution-event/distribution-event.service';
import { DistributionEvent } from '../distribution-event/entities/distribution-event.entity';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from './dto/update-distribution-rule.dto';
import { DistributionRule } from './entities/distribution-rule.entity';

@Injectable()
export class DistributionRuleService {
  constructor(
    @InjectModel(DistributionRule)
    private readonly distributionRuleModel: typeof DistributionRule,
    private readonly distributionEventService: DistributionEventService,
  ) {}

  /**
   * Yields a list of DistributionRules or throws a NotFoundException if the
   * repository return null, undefined, or an empty list.
   * @param {string[]} queues
   * @param {string[]} messageTypes
   * @returns {Promise<DistributionRule[]>}
   */
  async findAll(queues: string[], messageTypes: string[]) {
    const distributionRules = await this.distributionRuleModel.findAll({
      where: this._buildWhereClause(queues, messageTypes),
      include: [{ model: DistributionEvent }],
      attributes: { exclude: ['event'] },
    });

    if (_.isEmpty(distributionRules)) {
      throw new NotFoundException('Distribution rules not found!');
    }

    return distributionRules;
  }

  /**
   * Yields a DistributionRule or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} id
   * @returns {Promise<DistributionRule>}
   */
  async findOne(id: string, includeEvent: boolean = false) {
    const distributionRule = await this.distributionRuleModel.findByPk(id, {
      include: includeEvent ? [DistributionEvent] : null,
    });

    if (!distributionRule) {
      throw new NotFoundException(`Distribution rule for id=${id} not found!`);
    }

    return distributionRule;
  }

  /**
   * Creates a DistributionRule or throws a NotFoundException if a DistributionEvent
   * does not exist in the repository for the queue and messageType.
   * @param {CreateDistributionRuleDto} createDistributionRuleDto
   * @returns {Promise<ApiResponseDto<DistributionRule>>}
   */
  async create(createDistributionRuleDto: CreateDistributionRuleDto) {
    // Note: Throws a NotFoundException if the distribution event does not exits.
    const distributionEvent = await this.distributionEventService.findOne(
      createDistributionRuleDto.queue,
      createDistributionRuleDto.messageType,
    );

    // Bug: Because of the way constraints are handled, if the metadata is equal to null,
    //      the constraint for a unique combination of distributionEventId and metadata
    //      will not be applied.
    const distributionRule = await this.distributionRuleModel.create({
      distributionEventId: distributionEvent.id,
      ...createDistributionRuleDto,
    });

    return new ApiResponseDto(
      `Successfully created distribution rule for queue=${distributionEvent.queue} messageType=${distributionEvent.messageType}!`,
      distributionRule,
    );
  }

  /**
   * Updates a DistributionRule. Throws a NotFoundException if the repository returns
   * null/undefined or a BadRequestException if attempting to modify a default distribution
   * rule's metadata (must equal null).
   * @param {string} id 
   * @param {UpdateDistributionRuleDto} updateDistributionRuleDto 
   * @returns {Promise<ApiResponseDto<DistributionRule>>}
   */
  async update(
    id: string,
    updateDistributionRuleDto: UpdateDistributionRuleDto,
  ) {
    let distributionRule = await this.distributionRuleModel.findByPk(id);

    if (!distributionRule) {
      throw new NotFoundException(`Distribution rule for id=${id} not found!`);
    }

    if (
      distributionRule.metadata === null &&
      updateDistributionRuleDto.metadata !== null
    ) {
      throw new BadRequestException(
        'The metadata for a default distribution rule must be set to null',
      );
    }

    distributionRule = await distributionRule.update({
      ...updateDistributionRuleDto,
    });

    return new ApiResponseDto(
      `Successfully updated distribution rule!`,
      distributionRule,
    );
  }

  /**
   * Deletes a DistributionRule. Throws a NotFoundException if the repository
   * returns null/undefined or a BadRequestException if the DistributionRule
   * is the default for DistributionEvent.
   * @param {string} id
   * @returns {Promise<ApiResponseDto>}
   */
  async remove(id: string) {
    const distributionRule = await this.distributionRuleModel.findByPk(id);

    if (!distributionRule) {
      throw new NotFoundException(`Distribution rule for id=${id} not found!`);
    }

    if (distributionRule.metadata === null) {
      throw new BadRequestException(
        `Distribution rule id=${id} is the default distribution rule and cannot be deleted!`,
      );
    }

    await distributionRule.destroy();

    return new ApiResponseDto(
      `Successfully deleted distribution rule id=${id}!`,
    );
  }

  /**
   * Yields an object containing key-value pairs with the filter(s) (queues and/or
   * messsageTypes) that should be applied on a DistributionRule repository query.
   * @param {string[]} queues
   * @param {string[]} messageTypes
   * @returns
   */
  private _buildWhereClause(queues: string[], messageTypes: string[]) {
    const where: any = {};

    if (!_.isEmpty(queues)) {
      where['$event.queue$'] = {
        [Op.or]: queues,
      };
    }

    if (!_.isEmpty(messageTypes)) {
      where['$event.messageType$'] = {
        [Op.or]: messageTypes,
      };
    }

    return Object.keys(where).length > 0 ? where : null;
  }
}
