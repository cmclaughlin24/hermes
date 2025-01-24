import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { ExistsException, MissingException } from '@hermes/common';
import { DistributionRuleRepository } from './distribution-rule.repository';
import { DistributionRule } from './entities/distribution-rule.entity';
import { DistributionEvent } from '../../distribution-event/repository/entities/distribution-event.entity';
import { CreateDistributionRuleDto } from '../dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from '../dto/update-distribution-rule.dto';
import { DefaultRuleException } from '../../../common/errors/default-rule.exception';
import { Op } from 'sequelize';

@Injectable()
export class OrmDistributionRuleRepository
  implements DistributionRuleRepository
{
  constructor(
    @InjectModel(DistributionRule)
    private readonly distributionRuleModel: typeof DistributionRule,
  ) {}

  async findAll(eventTypes: string[]) {
    return this.distributionRuleModel.findAll({
      where: this._buildWhereClause(eventTypes),
      include: [{ model: DistributionEvent }],
      attributes: { exclude: ['event'] },
    });
  }

  async findOne(id: string, includeEvent: boolean = false) {
    return this.distributionRuleModel.findByPk(id, {
      include: includeEvent ? [DistributionEvent] : null,
    });
  }

  async create(createDistributionRuleDto: CreateDistributionRuleDto) {
    if (!createDistributionRuleDto.metadata) {
      const existingRule = await this.distributionRuleModel.findOne({
        where: {
          distributionEventType: createDistributionRuleDto.eventType,
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
      ...createDistributionRuleDto,
    });

    return distributionRule;
  }

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
