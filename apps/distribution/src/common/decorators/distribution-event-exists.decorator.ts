import { MissingException } from '@hermes/common';
import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DistributionEventService } from '../../resources/distribution-event/distribution-event.service';

@ValidatorConstraint({ name: 'DistributionEventExists', async: true })
@Injectable()
export class DistributionEventExistsRule
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly distributionEventService: DistributionEventService,
  ) {}

  async validate(
    eventType: string,
    _validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    try {
      const distributionEvent =
        await this.distributionEventService.findOne(eventType);

      if (!distributionEvent) {
        throw new MissingException(
          `Distribution Event for eventType=${eventType} not found!`,
        );
      }
    } catch (error) {
      return false;
    }

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Distribution Event for eventType=${validationArguments.value} doesn't exist`;
  }
}

export function DistributionEventExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName) {
    registerDecorator({
      name: 'DistributionEventExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: DistributionEventExistsRule,
    });
  };
}
