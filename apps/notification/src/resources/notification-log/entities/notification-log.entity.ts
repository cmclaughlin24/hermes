import {
  Column,
  CreatedAt, Model,
  Table,
  UpdatedAt
} from 'sequelize-typescript';

@Table
export class NotificationLog extends Model {
  @Column({ primaryKey: true })
  id: string;

  @Column
  job: string;

  @Column
  status: string;

  @Column
  attempts: number;

  @Column
  data: string;

  @Column({ allowNull: true })
  result: string;

  @Column({ allowNull: true })
  error: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
