import {
  ExistsException,
  MissingException,
  PushNotificationActionDto,
  RemoveCache,
  UseCache,
  defaultHashFn
} from '@hermes/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreatePushTemplateDto } from './dto/create-push-template.dto';
import { UpdatePushTemplateDto } from './dto/update-push-template.dto';
import { PushAction } from './entities/push-action.entity';
import { PushTemplate } from './entities/push-template.entity';

@Injectable()
export class PushTemplateService {
  private static readonly CACHE_KEY = 'push-notification';

  constructor(
    @InjectModel(PushTemplate)
    private readonly pushTemplateModel: typeof PushTemplate,
    @InjectModel(PushAction)
    private readonly pushActionModel: typeof PushAction,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * Yields a list of PushTemplates.
   * @returns {Promise<PushTemplate[]>}
   */
  async findAll() {
    return this.pushTemplateModel.findAll({
      include: {
        model: PushAction,
        attributes: { exclude: ['templateId'] },
      },
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
    return this.pushTemplateModel.findByPk(name, {
      include: {
        model: PushAction,
        attributes: { exclude: ['templateId'] },
      },
    });
  }

  /**
   * Creates a new PushTemplate or throws an ExistsException if an
   * push notification template name exists in the repository.
   * @param {CreatePushTemplateDto} createPushTemplateDto
   * @returns {Promise<PushTemplate>}
   */
  async create(createPushTemplateDto: CreatePushTemplateDto) {
    const existingTemplate = await this.pushTemplateModel.findByPk(
      createPushTemplateDto.name,
    );

    if (existingTemplate) {
      throw new ExistsException(
        `Push Notification Template ${createPushTemplateDto.name} already exists!`,
      );
    }

    const pushTemplate = await this.pushTemplateModel.create(
      {
        ...createPushTemplateDto,
      },
      { include: [PushAction] },
    );

    return pushTemplate;
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
    return this.sequelize.transaction(async (transaction) => {
      let pushTemplate = await this.pushTemplateModel.findByPk(name, {
        include: [PushAction],
        transaction,
      });

      if (!pushTemplate) {
        throw new MissingException(
          `Push Notification Template with ${name} not found!`,
        );
      }

      const { actions: actionsDto, ...templateDto } = updatePushTemplateDto;

      pushTemplate = await pushTemplate.update(
        { ...templateDto },
        { transaction },
      );

      // Note: All existing PushActions should be removed on an empty array.
      if (updatePushTemplateDto.actions) {
        await this._updatePushActions(pushTemplate, actionsDto, transaction);

        pushTemplate = await pushTemplate.reload({ transaction });
      }

      return pushTemplate;
    });
  }

  /**
   * Removes an PushTemplate or throws a MissingException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   * @returns {Promise<void>}
   */
  @RemoveCache({ key: PushTemplateService.CACHE_KEY })
  async remove(name: string) {
    const pushTemplate = await this.pushTemplateModel.findByPk(name);

    if (!pushTemplate) {
      throw new MissingException(
        `Push Notification Template with ${name} not found!`,
      );
    }

    await pushTemplate.destroy();
  }

  /**
   * Creates, updates, or removes actions for a push notification.
   * @param {PushTemplate} template
   * @param {PushNotificationActionDto[]} actions
   * @param {Transaction} transaction
   */
  private async _updatePushActions(
    template: PushTemplate,
    actions: PushNotificationActionDto[],
    transaction: Transaction,
  ) {
    // Todo: Refactor add/update/remove logic into one for-of loop if possible.
    for (const existingAction of template.actions) {
      const action = actions.find(
        (actionDto) => actionDto.action === existingAction.action,
      );

      if (action) {
        continue;
      }

      await existingAction.destroy({ transaction });
    }

    for (const action of actions) {
      const existingAction = template.actions.find(
        (curr) => curr.action === action.action,
      );

      if (!existingAction) {
        await this.pushActionModel.create(
          {
            templateId: template.id,
            action: action.action,
            title: action.title,
            icon: action.icon,
          },
          { transaction },
        );
      } else {
        await existingAction.update(
          {
            title: action.title ?? existingAction.title,
            icon: action.icon ?? existingAction.icon,
          },
          { transaction },
        );
      }
    }
  }
}
