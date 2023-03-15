import { DeliveryMethods } from '@notification/common';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  indexes: [
    {
      unique: true,
      fields: ['queue', 'event'],
    },
  ],
})
export class DistributionRule extends Model {
  @Column
  queue: string;

  @Column
  event: string;

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
