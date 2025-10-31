import { validateOrReject } from 'class-validator';
import Handlebars from 'handlebars';
import { NotificationDto } from '../interfaces/notification-dto.interface';
import { DtoValidationException } from '../../common/errors/dto-validation.error';
import { NotifierStrategy } from '../interfaces/notifier-strategy.interface';

export abstract class BaseNotifierStrategy<T extends NotificationDto>
  implements NotifierStrategy<T>
{
  abstract createNotificationDto(data: any): Promise<T>;

  abstract createTemplate(dto: T): Promise<T>;

  abstract notify(dto: T): Promise<any>;

  protected async validateOrReject(dto: T) {
    try {
      await validateOrReject(dto);
    } catch (errors) {
      const validationErrors = errors
        .map((error) => error.toString())
        .join(', ');
      throw new DtoValidationException(validationErrors);
    }
  }

  protected compileTemplate(
    input: string,
    context: { [key: string]: any },
  ): string {
    const template = Handlebars.compile(input);
    return template(context);
  }
}
