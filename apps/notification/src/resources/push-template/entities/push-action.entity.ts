import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { PushTemplate } from './push-template.entity';

@Table({ createdAt: false, updatedAt: false })
export class PushAction extends Model {
  @Column({ primaryKey: true })
  action: string;

  @Column
  title: string;

  @Column({ allowNull: true })
  icon: string;

  @ForeignKey(() => PushTemplate)
  templateId: string;

  @BelongsTo(() => PushTemplate)
  template: PushTemplate;
}
