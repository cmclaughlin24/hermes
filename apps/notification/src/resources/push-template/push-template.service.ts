import {
  ExistsException,
  MissingException,
  PushNotificationActionDto,
  RemoveCache,
  UseCache,
  defaultHashFn,
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePushTemplateDto } from './dto/create-push-template.dto';
import { UpdatePushTemplateDto } from './dto/update-push-template.dto';
import { PushAction } from './entities/push-action.entity';
import { PushTemplate } from './entities/push-template.entity';

@Injectable()
export class PushTemplateService {
  private static readonly CACHE_KEY = 'push-notification';

  constructor(
    @InjectRepository(PushTemplate)
    private readonly pushTemplateRepository: Repository<PushTemplate>,
    @InjectRepository(PushAction)
    private readonly pushActionRepository: Repository<PushAction>,
  ) {}

  /**
   * Yields a list of PushTemplates.
   * @returns {Promise<PushTemplate[]>}
   */
  async findAll() {
    return this.pushTemplateRepository.find({
      relations: { actions: true },
    });
  }

  /**
   * Yields an PushTemplate or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} name Template's name
   * @returns {Promise<PushTemplate>}
   */
  @UseCache({ key: PushTemplateService.CACHE_KEY })
  async findOne(name: string) {
    return this.pushTemplateRepository.findOne({
      where: { name },
      relations: { actions: true },
    });
  }

  /**
   * Creates a new PushTemplate or throws an ExistsException if an
   * push notification template name exists in the repository.
   * @param {CreatePushTemplateDto} createPushTemplateDto
   * @returns {Promise<PushTemplate>}
   */
  async create(createPushTemplateDto: CreatePushTemplateDto) {
    const existingTemplate = await this.pushTemplateRepository.findOneBy({
      name: createPushTemplateDto.name,
    });

    if (existingTemplate) {
      throw new ExistsException(
        `Push Notification Template ${createPushTemplateDto.name} already exists!`,
      );
    }

    const actions =
      createPushTemplateDto.actions?.map((action) =>
        this.pushActionRepository.create({ ...action }),
      ) ?? [];
    const pushTemplate = this.pushTemplateRepository.create({
      ...createPushTemplateDto,
      actions,
    });

    return this.pushTemplateRepository.save(pushTemplate);
  }

  /**
   * Updates a PushTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   * @param {UpdatePushTemplateDto} updatePushTemplateDto
   * @returns {Promise<PushTemplate>}
   */
  @RemoveCache({
    key: PushTemplateService.CACHE_KEY,
    hashFn: (key, args) => defaultHashFn(key, [args[0]]),
  })
  async update(name: string, updatePushTemplateDto: UpdatePushTemplateDto) {
    const actions =
      updatePushTemplateDto.actions &&
      (await Promise.all(
        updatePushTemplateDto.actions.map((action) =>
          this._preloadPushActions(action),
        ),
      ));
    const pushTemplate = await this.pushTemplateRepository.preload({
      name,
      ...updatePushTemplateDto,
      actions,
    });

    if (!pushTemplate) {
      throw new MissingException(
        `Push Notification Template with ${name} not found!`,
      );
    }

    return this.pushTemplateRepository.save(pushTemplate);
  }

  /**
   * Removes an PushTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   * @returns {Promise<void>}
   */
  @RemoveCache({ key: PushTemplateService.CACHE_KEY })
  async remove(name: string) {
    const pushTemplate = await this.pushTemplateRepository.findOneBy({ name });

    if (!pushTemplate) {
      throw new MissingException(
        `Push Notification Template with ${name} not found!`,
      );
    }

    await this.pushTemplateRepository.remove(pushTemplate);
  }

  /**
   * Updates an existing push action or creates a new action if the repository
   * returns null or undefined.
   * @param {PushNotificationActionDto} action
   * @returns {Promise<PushAction>}
   */
  private async _preloadPushActions(action: PushNotificationActionDto) {
    const existingAction = await this.pushActionRepository.preload({
      ...action,
    });

    if (existingAction) {
      return existingAction;
    }

    return this.pushActionRepository.create(action);
  }
}
