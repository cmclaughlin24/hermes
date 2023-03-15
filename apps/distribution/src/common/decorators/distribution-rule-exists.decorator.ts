import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { DistributionRuleService } from '../../resources/distribution-rule/distribution-rule.service';

@ValidatorConstraint({ name: 'DistributionRuleExists', async: true })
@Injectable()
export class DistributionRuleExistsRule implements ValidatorConstraintInterface {
  constructor(
    private readonly distributionRuleService: DistributionRuleService,
  ) {}

  async validate(
    name: string,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    try {
      await this.distributionRuleService.findOne(
        validationArguments.object['queue'],
        name,
      );
    } catch (error) {
      return false;
    }

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Distribution Rule ${validationArguments.value} doesn't exist`;
  }
}

export function DistributionRuleExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName) {
    registerDecorator({
      name: 'DistributionRuleExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: DistributionRuleExistsRule,
    });
  };
}
