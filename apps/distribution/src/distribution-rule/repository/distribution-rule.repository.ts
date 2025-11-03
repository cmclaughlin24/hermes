import { Injectable } from '@nestjs/common';
import { CreateDistributionRuleDto } from '../dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from '../dto/update-distribution-rule.dto';
import { DistributionRuleEntity } from './entities/distribution-rule.entity';

@Injectable()
export abstract class DistributionRuleRepository {
  abstract findAll(eventTypes: string[]): Promise<DistributionRuleEntity[]>;
  abstract findOne(
    id: string,
    includeEvent: boolean,
  ): Promise<DistributionRuleEntity>;
  abstract create(
    createDistributionRuleDto: CreateDistributionRuleDto,
  ): Promise<DistributionRuleEntity>;
  abstract update(
    id: string,
    updateDistributionRuleDto: UpdateDistributionRuleDto,
  ): Promise<DistributionRuleEntity>;
  abstract remove(id: string): Promise<void>;
}
