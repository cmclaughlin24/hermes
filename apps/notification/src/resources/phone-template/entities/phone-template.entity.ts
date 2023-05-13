import { PhoneMethods } from '@notification/common';
import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';

@Table
export class PhoneTemplate extends Model {
  @Column({ primaryKey: true })
  name: string;

  @Column({ primaryKey: true })
  deliveryMethod: PhoneMethods;

  @Column({ type: DataType.STRING(2000) })
  template: string;

  @Column({ type: DataType.JSON, allowNull: true })
  context: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
