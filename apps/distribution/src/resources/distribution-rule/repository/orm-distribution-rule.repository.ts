import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { ExistsException, MissingException } from '@hermes/common';
import { DistributionRuleRepository } from './distribution-rule.repository';
import { DistributionRule } from './entities/distribution-rule.entity';
import { CreateDistributionRuleDto } from '../dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from '../dto/update-distribution-rule.dto';
import { DefaultRuleException } from '../../../common/errors/default-rule.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrmDistributionRuleRepository
  implements DistributionRuleRepository
{
  constructor(
    @InjectRepository(DistributionRule)
    private readonly distributionRuleModel: Repository<DistributionRule>,
  ) {}

  async findAll(eventTypes: string[]) {
    return this.distributionRuleModel.find({
      where: this._buildWhereClause(eventTypes),
    });
  }

  async findOne(id: string, includeEvent: boolean = false) {
    return this.distributionRuleModel.findOne({
      where: { id },
      relations: { event: includeEvent },
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

    const rule = this.distributionRuleModel.create({
      ...createDistributionRuleDto,
      distributionEventType: createDistributionRuleDto.eventType,
    });

    return this.distributionRuleModel.save(rule);
  }

  async update(
    id: string,
    updateDistributionRuleDto: UpdateDistributionRuleDto,
  ) {
    const rule = await this.distributionRuleModel.preload({
      id,
      ...updateDistributionRuleDto,
    });

    if (!rule) {
      throw new MissingException(`Distribution rule for id=${id} not found!`);
    }

    return this.distributionRuleModel.save(rule);
  }

  async remove(id: string) {
    const rule = await this.distributionRuleModel.findOneBy({ id });

    if (!rule) {
      throw new MissingException(`Distribution rule for id=${id} not found!`);
    }

    if (rule.metadata === null) {
      throw new DefaultRuleException(
        `Distribution rule id=${id} is the default distribution rule and cannot be deleted!`,
      );
    }

    await this.distributionRuleModel.remove(rule);
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
      where['distributionEventType'] = eventTypes;
    }

    return Object.keys(where).length > 0 ? where : null;
  }
}
