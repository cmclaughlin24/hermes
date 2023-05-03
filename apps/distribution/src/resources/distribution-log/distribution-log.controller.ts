import { Controller } from '@nestjs/common';
import { DistributionLogService } from './distribution-log.service';

@Controller('distribution-log')
export class DistributionLogController {
  constructor(private readonly distributionLogService: DistributionLogService) {}
}
