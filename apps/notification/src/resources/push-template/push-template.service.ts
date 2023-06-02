import { ApiResponseDto } from '@hermes/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as _ from 'lodash';
import { CreatePushNotificationDto } from '../../common/dto/create-push-notification.dto';
import { UpdatePushTemplateDto } from './dto/update-push-template.dto';
import { PushTemplate } from './entities/push-template.entity';

@Injectable()
export class PushTemplateService {
  constructor(
    @InjectModel(PushTemplate)
    private readonly pushTemplateModel: typeof PushTemplate,
  ) {}

  /**
   * Yields a list of PushTemplate or throws a NotFoundException if
   * the repository returns null, undefined, or an empty list.
   * @returns {Promise<PushTemplate[]>}
   */
  async findAll() {
    const pushTemplates = await this.pushTemplateModel.findAll();

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
    const pushTemplate = await this.pushTemplateModel.findByPk(name);

    if (!pushTemplate) {
      throw new NotFoundException(
        `Push Notification Template with ${name} not found!`,
      );
    }

    return pushTemplate;
  }

  async create(createPushTemplateDto: CreatePushNotificationDto) {}

  async update(name: string, updatePushTemplateDto: UpdatePushTemplateDto) {}

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
}
