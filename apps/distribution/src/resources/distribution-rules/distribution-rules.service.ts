import { Injectable } from '@nestjs/common';
import { CreateDistributionRuleDto } from './dto/create-distribution-rule.dto';
import { UpdateDistributionRuleDto } from './dto/update-distribution-rule.dto';

@Injectable()
export class DistributionRulesService {
  constructor() {}

  findAll() {}

  findOne(name: string) {}

  create(createDistributionRuleDto: CreateDistributionRuleDto) {}

  update(name: string, updateDistributionRuleDto:UpdateDistributionRuleDto) {}

  remove(name: string) {}
}
