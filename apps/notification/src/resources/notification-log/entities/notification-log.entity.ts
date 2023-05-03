import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  UpdatedAt
} from 'sequelize-typescript';

@Table
export class NotificationLog extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column
  job: string;

  @Column
  state: string;

  @Column
  attempts: number;

  @Column({ type: DataType.JSON })
  data: string;

  @Column({ allowNull: true, type: DataType.JSON })
  result: string;

  @Column({ allowNull: true, type: DataType.JSON })
  error: Error;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
