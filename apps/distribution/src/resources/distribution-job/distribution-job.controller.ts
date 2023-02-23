import { Controller } from '@nestjs/common';
import { DistributionJobService } from './distribution-job.service';

@Controller('distribution-job')
export class DistributionJobController {
  constructor(private readonly distributionJobService: DistributionJobService) {}
}
