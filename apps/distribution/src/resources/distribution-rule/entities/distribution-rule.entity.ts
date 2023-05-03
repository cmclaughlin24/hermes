import { DeliveryMethods } from '@notification/common';
import {
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Subscription } from '../../subscription/entities/subscription.entity';

@Table({
  indexes: [
    {
      unique: true,
      fields: ['queue', 'messageType'],
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

  @Column
  emailSubject: string;

  @Column({ type: DataType.STRING(2000), allowNull: true })
  emailTemplate: string;

  @Column({ type: DataType.STRING(2000), allowNull: true })
  html: string;

  @Column
  text: string;

  @Default(false)
  @Column
  checkDeliveryWindow: boolean;

  @HasMany(() => Subscription)
  subscriptions: Subscription[];
}
