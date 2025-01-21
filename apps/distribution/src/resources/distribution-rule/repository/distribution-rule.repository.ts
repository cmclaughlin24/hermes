import { CreateDistributionRuleDto } from '../dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from '../dto/update-distribution-rule.dto';
import { DistributionRule } from './entities/distribution-rule.entity';

export abstract class DistributionRuleRepository {
  abstract findAll(eventTypes: string[]): Promise<DistributionRule[]>;
  abstract findOne(
    id: string,
    includeEvent: boolean,
  ): Promise<DistributionRule>;
  abstract create(
    createDistributionRuleDto: CreateDistributionRuleDto,
  ): Promise<DistributionRule>;
  abstract update(
    id: string,
    updateDistributionRuleDto: UpdateDistributionRuleDto,
  ): Promise<DistributionRule>;
  abstract remove(id: string): Promise<void>;
}
