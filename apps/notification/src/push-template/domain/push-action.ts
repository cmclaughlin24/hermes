import { AutoMap } from '@automapper/classes';
import { PushTemplate } from './push-template';

export class PushAction {
  @AutoMap()
  action: string;

  @AutoMap()
  title: string;

  @AutoMap()
  icon: string;

  @AutoMap(() => PushTemplate)
  template?: PushTemplate;
}
