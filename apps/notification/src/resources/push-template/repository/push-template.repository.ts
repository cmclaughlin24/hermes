import { Injectable } from '@nestjs/common';
import { PushTemplate } from '../../../infrastructure/persistance/postgres/entities/push-template.entity';
import { CreatePushTemplateDto } from '../dto/create-push-template.dto';
import { UpdatePushTemplateDto } from '../dto/update-push-template.dto';

@Injectable()
export abstract class PushTemplateRepository {
  abstract findAll(): Promise<PushTemplate[]>;
  abstract findOne(name: string): Promise<PushTemplate>;
  abstract create(
    createPushTemplateDto: CreatePushTemplateDto,
  ): Promise<PushTemplate>;
  abstract update(
    name: string,
    updatePushTemplateDto: UpdatePushTemplateDto,
  ): Promise<PushTemplate>;
  abstract remove(name: string): Promise<void>;
}
