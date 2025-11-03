import { OmitType } from '@nestjs/swagger';
import { CreateDistributionEventDto } from './create-distribution-event.dto';

export class UpdateDistributionEventDto extends OmitType(
  CreateDistributionEventDto,
  ['eventType', 'rules']
) {
}
