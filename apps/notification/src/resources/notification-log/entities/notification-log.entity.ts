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
  status: string;

  @Column
  attempts: number;

  @Column({ type: DataType.STRING(1000) })
  data: string;

  @Column({ allowNull: true, type: DataType.STRING(1000) })
  result: string;

  @Column({ allowNull: true, type: DataType.STRING(1000) })
  error: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
