import { Injectable } from '@nestjs/common';
import { PushTemplateEntity } from './entities/push-template.entity';
import { CreatePushTemplateDto } from '../dto/create-push-template.dto';
import { UpdatePushTemplateDto } from '../dto/update-push-template.dto';

@Injectable()
export abstract class PushTemplateRepository {
  abstract findAll(): Promise<PushTemplateEntity[]>;
  abstract findOne(name: string): Promise<PushTemplateEntity>;
  abstract create(
    createPushTemplateDto: CreatePushTemplateDto,
  ): Promise<PushTemplateEntity>;
  abstract update(
    name: string,
    updatePushTemplateDto: UpdatePushTemplateDto,
  ): Promise<PushTemplateEntity>;
  abstract remove(name: string): Promise<void>;
}
