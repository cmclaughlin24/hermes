import { ApiResponseDto, PushNotificationActionDto } from '@hermes/common';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreatePushTemplateDto } from './dto/create-push-template.dto';
import { UpdatePushTemplateDto } from './dto/update-push-template.dto';
import { PushAction } from './entities/push-action.entity';
import { PushTemplate } from './entities/push-template.entity';

@Injectable()
export class PushTemplateService {
  constructor(
    @InjectModel(PushTemplate)
    private readonly pushTemplateModel: typeof PushTemplate,
    @InjectModel(PushAction)
    private readonly pushActionModel: typeof PushAction,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * Yields a list of PushTemplate or throws a NotFoundException if
   * the repository returns null, undefined, or an empty list.
   * @returns {Promise<PushTemplate[]>}
   */
  async findAll() {
    const pushTemplates = await this.pushTemplateModel.findAll({
      include: {
        model: PushAction,
        attributes: { exclude: ['templateId'] },
      },
    });

    if (_.isEmpty(pushTemplates)) {
      throw new NotFoundException(`Push Notification templates not found!`);
    }

    return pushTemplates;
  }

  /**
   * Yields an PushTemplate or throws a NotFoundException if the repository
   * returns null or undefined.
   * @param {string} name Template's name
   * @returns {Promise<PushTemplate>}
   */
  async findOne(name: string) {
    const pushTemplate = await this.pushTemplateModel.findByPk(name, {
      include: {
        model: PushAction,
        attributes: { exclude: ['templateId'] },
      },
    });

    if (!pushTemplate) {
      throw new NotFoundException(
        `Push Notification Template with ${name} not found!`,
      );
    }

    return pushTemplate;
  }

  /**
   * Creates a new PushTemplate or throws a BadRequestException if an
   * push notification template name exists in the repository.
   * @param {CreatePushTemplateDto} createPushTemplateDto
   * @returns {Promise<ApiResponseDto<PushTemplate>>}
   */
  async create(createPushTemplateDto: CreatePushTemplateDto) {
    const existingTemplate = await this.pushTemplateModel.findByPk(
      createPushTemplateDto.name,
    );

    if (existingTemplate) {
      throw new BadRequestException(
        `Push Notification Template ${createPushTemplateDto.name} already exists!`,
      );
    }

    const pushTemplate = await this.pushTemplateModel.create(
      {
        ...createPushTemplateDto,
      },
      { include: [PushAction] },
    );

    return new ApiResponseDto<PushTemplate>(
      `Successfully created push notification template ${pushTemplate.name}!`,
      pushTemplate,
    );
  }

  /**
   * Updates a PushTemplate or throws a NotFoundException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   * @param {UpdatePushTemplateDto} updatePushTemplateDto
   * @returns {Promise<ApiResponseDto<PushTemplate>>}
   */
  async update(name: string, updatePushTemplateDto: UpdatePushTemplateDto) {
    return this.sequelize.transaction(async (transaction) => {
      let pushTemplate = await this.pushTemplateModel.findByPk(name, {
        include: [PushAction],
        transaction,
      });

      if (!pushTemplate) {
        throw new NotFoundException(
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

      return new ApiResponseDto<PushTemplate>(
        `Successfully updated push notification template ${pushTemplate.name}!`,
        pushTemplate,
      );
    });
  }

  /**
   * Removes an PushTemplate or throws a NotFoundException if the
   * repository returns null or undefined.
   * @param {string} name Template's name
   * @returns {Promise<ApiResponseDto>}
   */
  async remove(name: string) {
    const pushTemplate = await this.pushTemplateModel.findByPk(name);

    if (!pushTemplate) {
      throw new NotFoundException(
        `Push Notification Template with ${name} not found!`,
      );
    }

    await pushTemplate.destroy();

    return new ApiResponseDto(`Successfully delete push notification ${name}`);
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
