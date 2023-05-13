import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class PhoneTemplate extends Model {
  @Column({ primaryKey: true })
  name: string;
}
