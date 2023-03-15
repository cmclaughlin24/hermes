import { DeliveryMethods } from '@notification/common';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  indexes: [
    {
      unique: true,
      fields: ['queue', 'messageType'],
    },
  ],
})
export class DistributionRule extends Model {
  @Column
  queue: string;

  @Column
  messageType: string;

  @Column({
    type: DataType.ARRAY(
      DataType.ENUM(
        DeliveryMethods.EMAIL,
        DeliveryMethods.SMS,
        DeliveryMethods.RADIO,
      ),
    ),
  })
  deliveryMethods: DeliveryMethods[];
}
