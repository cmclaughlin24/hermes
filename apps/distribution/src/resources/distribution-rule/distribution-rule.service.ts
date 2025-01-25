import { MissingException } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { DistributionEventService } from '../distribution-event/distribution-event.service';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from './dto/update-distribution-rule.dto';
import { DistributionRuleRepository } from './repository/distribution-rule.repository';
import { DefaultRuleException } from '../../common/errors/default-rule.exception';

@Injectable()
export class DistributionRuleService {
  constructor(
    private readonly repository: DistributionRuleRepository,
    private readonly distributionEventService: DistributionEventService,
  ) {}

  /**
   * Yields a list of DistributionRules.
   * @param {string[]} eventTypes
   */
  async findAll(eventTypes: string[]) {
    return this.repository.findAll(eventTypes);
  }

  /**
   * Yields a DistributionRule.
   * @param {string} id
   */
  async findOne(id: string, includeEvent: boolean = false) {
    return this.repository.findOne(id, includeEvent);
  }

  /**
   * Creates a DistributionRule or throws a MissingException if a DistributionEvent
   * does not exist in the repository for the queue and eventType.
   * @param {CreateDistributionRuleDto} createDistributionRuleDto
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

    return this.repository.create(createDistributionRuleDto);
  }

  /**
   * Updates a DistributionRule. Throws a MissingException if the repository returns
   * null/undefined or a DefaultRuleException if attempting to modify a default distribution
   * rule's metadata (must equal null).
   * @param {string} id
   * @param {UpdateDistributionRuleDto} updateDistributionRuleDto
   */
  async update(
    id: string,
    updateDistributionRuleDto: UpdateDistributionRuleDto,
  ) {
    const distributionRule = await this.repository.findOne(id, false);

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

    return this.repository.update(id, updateDistributionRuleDto);
  }

  /**
   * Deletes a DistributionRule. Throws a MissingException if the repository
   * returns null/undefined or a DefaultRuleException if the DistributionRule
   * is the default for DistributionEvent.
   * @param {string} id
   */
  async remove(id: string) {
    await this.repository.remove(id);
  }
}
