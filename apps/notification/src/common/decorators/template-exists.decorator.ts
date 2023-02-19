import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { EmailTemplateService } from '../../resources/email-template/email-template.service';

@ValidatorConstraint({ name: 'TemplateExists', async: true })
@Injectable()
export class TemplateExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  async validate(name: string) {
    try {
      await this.emailTemplateService.findOne(name);
    } catch (error) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Template ${args.value} doesn't exist`;
  }
}

export function TemplateExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'TemplateExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: TemplateExistsRule,
    });
  };
}
