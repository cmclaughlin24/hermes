import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from 'sequelize-typescript';

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

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
