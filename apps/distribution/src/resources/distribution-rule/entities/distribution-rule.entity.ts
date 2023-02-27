import { DeliveryMethods, DistributionQueues } from '@notification/common';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Subscription } from '../../subscription/entities/subscription.entity';

@Table({
  indexes: [
    {
      unique: true,
      fields: ['name', 'queue'],
    },
  ],
})
export class DistributionRule extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column
  name: string;

  @Column({
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

  @HasMany(() => Subscription)
  subscriptions: Subscription[]
}
