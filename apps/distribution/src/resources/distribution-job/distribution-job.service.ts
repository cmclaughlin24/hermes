import { Injectable } from '@nestjs/common';
import { CreateDefaultDistributionJobDto } from './dto/create-distribution-default-job.dto';

@Injectable()
export class DistributionJobService {
  constructor() {}

  findDefaultDistributionJobs() {}

  findDefaultDistributionJob(id: number) {}

  createDefaultDistributionJob(
    createDefaultDistributionJob: CreateDefaultDistributionJobDto,
  ) {}
}
