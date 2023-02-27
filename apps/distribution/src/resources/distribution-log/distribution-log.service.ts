import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DistributionLog } from './entities/distribution-log.entity';

@Injectable()
export class DistributionLogService {
  constructor(
    @InjectModel(DistributionLog)
    private readonly distritbutionLogModel: typeof DistributionLog,
  ) {}

  findAll() {}

  findOne(id: string) {}

  createOrUpdate() {}
}
