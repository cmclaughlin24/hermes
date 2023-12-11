import { ExistsException, MissingException } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { DefaultRuleException } from '../../common/errors/default-rule.exception';
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
   * Yields a list of DistributionRules.
   * @param {string[]} eventTypes
   * @returns {Promise<DistributionRule[]>}
   */
  async findAll(eventTypes: string[]) {
    return this.distributionRuleModel.findAll({
      where: this._buildWhereClause(eventTypes),
      include: [{ model: DistributionEvent }],
      attributes: { exclude: ['event'] },
    });
  }

  /**
   * Yields a DistributionRule.
   * @param {string} id
   * @returns {Promise<DistributionRule>}
   */
  async findOne(id: string, includeEvent: boolean = false) {
    return this.distributionRuleModel.findByPk(id, {
      include: includeEvent ? [DistributionEvent] : null,
    });
  }

  /**
   * Creates a DistributionRule or throws a MissingException if a DistributionEvent
   * does not exist in the repository for the queue and eventType.
   * @param {CreateDistributionRuleDto} createDistributionRuleDto
   * @returns {Promise<DistributionRule>}
   */
  async create(createDistributionRuleDto: CreateDistributionRuleDto) {
    const distributionEvent = await this.distributionEventService.findOne(
      createDistributionRuleDto.eventType,
    );

    if (!distributionEvent) {
      throw new MissingException(
        `Distribution Event for eventType=${createDistributionRuleDto.eventType} not found!`,
      );
    }

    if (!createDistributionRuleDto.metadata) {
      const existingRule = await this.distributionRuleModel.findOne({
        where: {
          distributionEventType: distributionEvent.eventType,
          metadata: null,
        },
      });

      // Note: Because of the way constraints are handled, manually check if a default
      //       distribution rule already exists if the CreateDistributionRuleDto has a
      //       metadata of null.
      if (existingRule) {
        throw new ExistsException(
          'A default distribution rule already exists (metadata=null)!',
        );
      }
    }

    const distributionRule = await this.distributionRuleModel.create({
      distributionEventType: distributionEvent.eventType,
      ...createDistributionRuleDto,
    });

    return distributionRule;
  }

  /**
   * Updates a DistributionRule. Throws a MissingException if the repository returns
   * null/undefined or a DefaultRuleException if attempting to modify a default distribution
   * rule's metadata (must equal null).
   * @param {string} id
   * @param {UpdateDistributionRuleDto} updateDistributionRuleDto
   * @returns {Promise<DistributionRule>}
   */
  async update(
    id: string,
    updateDistributionRuleDto: UpdateDistributionRuleDto,
  ) {
    let distributionRule = await this.distributionRuleModel.findByPk(id);

    if (!distributionRule) {
      throw new MissingException(`Distribution rule for id=${id} not found!`);
    }

    if (
      distributionRule.metadata === null &&
      updateDistributionRuleDto.metadata !== null
    ) {
      throw new DefaultRuleException(
        'The metadata for a default distribution rule must be set to null',
      );
    }

    distributionRule = await distributionRule.update({
      ...updateDistributionRuleDto,
    });

    return distributionRule;
  }

  /**
   * Deletes a DistributionRule. Throws a MissingException if the repository
   * returns null/undefined or a DefaultRuleException if the DistributionRule
   * is the default for DistributionEvent.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async remove(id: string) {
    const distributionRule = await this.distributionRuleModel.findByPk(id);

    if (!distributionRule) {
      throw new MissingException(`Distribution rule for id=${id} not found!`);
    }

    if (distributionRule.metadata === null) {
      throw new DefaultRuleException(
        `Distribution rule id=${id} is the default distribution rule and cannot be deleted!`,
      );
    }

    await distributionRule.destroy();
  }

  /**
   * Yields an object containing key-value pairs with the filter(s) (eventTypes)
   * that should be applied on a DistributionRule repository query.
   * @param {string[]} eventTypes
   * @returns
   */
  private _buildWhereClause(eventTypes: string[]) {
    const where: any = {};

    if (!_.isEmpty(eventTypes)) {
      where['$event.eventType$'] = {
        [Op.or]: eventTypes,
      };
    }

    return Object.keys(where).length > 0 ? where : null;
  }
}
