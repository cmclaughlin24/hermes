import { Injectable } from '@nestjs/common';
import { DefaultRuleException } from '../../common/errors/default-rule.exception';
import { CreateDistributionEventDto } from './dto/create-distribution-event.dto';
import { UpdateDistributionEventDto } from './dto/update-distribution-event.dto';
import { DistributionEventRepository } from './repository/distribution-event.repository';

@Injectable()
export class DistributionEventService {
  constructor(private readonly repository: DistributionEventRepository) {}

  /**
   * Yields a list of DistributionEvents.
   * @param {boolean} includeRules
   * @param {boolean} includeSubscriptions
   */
  async findAll(includeRules: boolean, includeSubscriptions: boolean) {
    return this.repository.findAll(includeRules, includeSubscriptions);
  }

  /**
   * Yields a DistributionEvent.
   * @param {string} eventType
   * @param {boolean} includeRules
   * @param {boolean} includeSubscriptions
   */
  async findOne(
    eventType: string,
    includeRules: boolean = false,
    includeSubscriptions: boolean = false,
  ) {
    return this.repository.findOne(
      eventType,
      includeRules,
      includeSubscriptions,
    );
  }

  /**
   * Creates a DistributionEvent. Throws an ExistsException if a distribution event
   * for a queue and eventType exists in the repository or a DefaultRuleExcpetion if
   * an event does not have a default distribution rule.
   * @param {CreateDistributionEventDto} createDistributionEventDto
   */
  async create(createDistributionEventDto: CreateDistributionEventDto) {
    const hasDefaultRule = createDistributionEventDto.rules?.some(
      (rule) => rule.metadata == null,
    );

    if (!hasDefaultRule) {
      throw new DefaultRuleException(
        `Distribution Event for eventType=${createDistributionEventDto.eventType} must have a default distribution rule (metadata=null)`,
      );
    }

    return this.repository.create(createDistributionEventDto);
  }

  /**
   * Updates a DistributionEvent or throws a MissingException if the repository
   * returns null or undefined.
   * @param {string} eventType
   * @param {UpdateDistributionEventDto} updateDistributionEventDto
   */
  async update(
    eventType: string,
    updateDistributionEventDto: UpdateDistributionEventDto,
  ) {
    return this.repository.update(eventType, updateDistributionEventDto);
  }

  /**
   * Removes a DistributionEvent or throws a MissingException if the repository
   * returns null or undefined.
   * @param {string} eventType
   */
  async remove(eventType: string) {
    await this.repository.remove(eventType);
  }
}
