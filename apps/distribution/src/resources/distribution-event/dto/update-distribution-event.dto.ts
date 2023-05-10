import { PartialType } from '@nestjs/swagger';
import { CreateDistributionEventDto } from './create-distribution-event.dto';

export class UpdateDistributionEventDto extends PartialType(CreateDistributionEventDto) {}
