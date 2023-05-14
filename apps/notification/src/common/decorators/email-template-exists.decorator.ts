import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { EmailTemplateService } from '../../resources/email-template/email-template.service';

@ValidatorConstraint({ name: 'EmailTemplateExists', async: true })
@Injectable()
export class EmailTemplateExistsRule implements ValidatorConstraintInterface {
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

export function EmailTemplateExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'EmailTemplateExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: EmailTemplateExistsRule,
    });
  };
}
