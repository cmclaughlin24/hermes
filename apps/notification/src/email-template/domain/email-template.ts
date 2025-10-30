import { AutoMap } from '@automapper/classes';

export class EmailTemplate {
  @AutoMap()
  name: string;

  @AutoMap()
  subject: string;

  @AutoMap()
  template: string;

  @AutoMap()
  context: { [key: string]: any };

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;
}
