import { DeliveryMethods, DistributionQueues } from '@notification/common';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class DistributionRule extends Model {
  @Column({
    primaryKey: true,
  })
  name: string;

  @Column({
    primaryKey: true,
    type: DataType.ENUM(DistributionQueues.DEFAULT),
  })
  queue: string;

  @Column({
    type: DataType.ARRAY(
      DataType.ENUM(
        DeliveryMethods.EMAIL,
        DeliveryMethods.SMS,
        DeliveryMethods.RADIO,
      ),
    ),
  })
  deliveryMethods: string[];
}
