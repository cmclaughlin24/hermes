import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExistsException, MissingException } from '@hermes/common';
import { Repository } from 'typeorm';
import { EmailTemplateRepository } from './email-template.repository';
import { EmailTemplateEntity } from './entities/email-template.entity';
import { CreateEmailTemplateDto } from '../dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { EmailTemplate } from '../domain/email-template';

@Injectable()
export class OrmEmailTemplateRepository implements EmailTemplateRepository {
  constructor(
    @InjectRepository(EmailTemplateEntity)
    private readonly emailTemplateModel: Repository<EmailTemplateEntity>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async findAll() {
    return this.emailTemplateModel
      .find()
      .then((entities) =>
        this.mapper.mapArray(entities, EmailTemplateEntity, EmailTemplate),
      );
  }

  async findOne(name: string) {
    return this.emailTemplateModel
      .findOneBy({ name })
      .then((entity) => this._toDomain(entity));
  }

  async create(createEmailTemplateDto: CreateEmailTemplateDto) {
    const existingTemplate = await this.emailTemplateModel.findOneBy({
      name: createEmailTemplateDto.name,
    });

    if (existingTemplate) {
      throw new ExistsException(
        `Email Template ${createEmailTemplateDto.name} already exists!`,
      );
    }

    const entity = this.emailTemplateModel.create(createEmailTemplateDto);

    return this.emailTemplateModel
      .save(entity)
      .then((entity) => this._toDomain(entity));
  }

  async update(name: string, updateEmailTemplateDto: UpdateEmailTemplateDto) {
    const entity = await this.emailTemplateModel.preload({
      name,
      ...updateEmailTemplateDto,
    });

    if (!entity) {
      throw new MissingException(`Email Template ${name} not found!`);
    }

    return this.emailTemplateModel
      .save(entity)
      .then((entity) => this._toDomain(entity));
  }

  async remove(name: string) {
    const entity = await this.emailTemplateModel.findOneBy({
      name,
    });

    if (!entity) {
      throw new MissingException(`Email Template ${name} not found!`);
    }

    await this.emailTemplateModel.remove(entity);
  }

  private _toDomain(entity: EmailTemplateEntity): EmailTemplate {
    console.log(entity);
    return this.mapper.map(entity, EmailTemplateEntity, EmailTemplate);
  }
}
