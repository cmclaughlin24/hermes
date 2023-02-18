import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class EmailTemplate extends Model {
  @Column({
    primaryKey: true,
    unique: true,
  })
  name: string;

  @Column({ type: DataType.STRING(2000) })
  template: string;

  @Column({ type: DataType.JSON })
  context: string;
}
