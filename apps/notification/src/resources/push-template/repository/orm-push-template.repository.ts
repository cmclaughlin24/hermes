import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ExistsException,
  MissingException,
  PushNotificationActionDto,
} from '@hermes/common';
import { Repository } from 'typeorm';
import { PushTemplate } from './entities/push-template.entity';
import { PushAction } from './entities/push-action.entity';
import { PushTemplateRepository } from './push-template.repository';
import { CreatePushTemplateDto } from '../dto/create-push-template.dto';
import { UpdatePushTemplateDto } from '../dto/update-push-template.dto';

@Injectable()
export class OrmPushTemplateRepository implements PushTemplateRepository {
  constructor(
    @InjectRepository(PushTemplate)
    private readonly pushTemplateModel: Repository<PushTemplate>,
    @InjectRepository(PushAction)
    private readonly pushActionModel: Repository<PushAction>,
  ) {}

  async findAll() {
    return this.pushTemplateModel.find({
      relations: { actions: true },
    });
  }

  async findOne(name: string) {
    return this.pushTemplateModel.findOne({
      where: { name },
      relations: { actions: true },
    });
  }

  async create(createPushTemplateDto: CreatePushTemplateDto) {
    const existingTemplate = await this.pushTemplateModel.findOneBy({
      name: createPushTemplateDto.name,
    });

    if (existingTemplate) {
      throw new ExistsException(
        `Push Notification Template ${createPushTemplateDto.name} already exists!`,
      );
    }

    const actions =
      createPushTemplateDto.actions?.map((action) =>
        this.pushActionModel.create({ ...action }),
      ) ?? [];
    const pushTemplate = this.pushTemplateModel.create({
      ...createPushTemplateDto,
      actions,
    });

    return this.pushTemplateModel.save(pushTemplate);
  }

  async update(name: string, updatePushTemplateDto: UpdatePushTemplateDto) {
    const actions =
      updatePushTemplateDto.actions &&
      (await Promise.all(
        updatePushTemplateDto.actions.map((action) =>
          this._preloadPushActions(action),
        ),
      ));
    const pushTemplate = await this.pushTemplateModel.preload({
      name,
      ...updatePushTemplateDto,
      actions,
    });

    if (!pushTemplate) {
      throw new MissingException(
        `Push Notification Template with ${name} not found!`,
      );
    }

    return this.pushTemplateModel.save(pushTemplate);
  }

  async remove(name: string) {
    const pushTemplate = await this.pushTemplateModel.findOneBy({ name });

    if (!pushTemplate) {
      throw new MissingException(
        `Push Notification Template with ${name} not found!`,
      );
    }

    await this.pushTemplateModel.remove(pushTemplate);
  }

  /**
   * Updates an existing push action or creates a new action if the repository
   * returns null or undefined.
   * @param {PushNotificationActionDto} action
   */
  private async _preloadPushActions(action: PushNotificationActionDto) {
    const existingAction = await this.pushActionModel.preload({
      ...action,
    });

    if (existingAction) {
      return existingAction;
    }

    return this.pushActionModel.create(action);
  }
}

