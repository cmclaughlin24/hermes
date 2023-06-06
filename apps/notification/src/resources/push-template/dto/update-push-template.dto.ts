import { PushNotificationDto } from '@hermes/common';
import { PartialType } from '@nestjs/swagger';

export class UpdatePushTemplateDto extends PartialType(PushNotificationDto) {}
