import { DistributionQueues } from '@notification/common';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class DistributionRule extends Model {
  @Column({
    primaryKey: true,
  })
  name: string;

  @Column({
    primaryKey: true,
    type: DataType.ENUM,
    values: [DistributionQueues.DEFAULT],
  })
  queue: string;
}
