import { DeliveryMethods } from '@hermes/common';
import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { DistributionEvent } from '../../distribution-event/entities/distribution-event.entity';

@Table({
  indexes: [
    {
      unique: true,
      fields: ['distributionEventType', 'metadata'],
    },
  ],
})
export class DistributionRule extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  id: string;

  @ForeignKey(() => DistributionEvent)
  distributionEventType: string;

  @Column({ type: DataType.TEXT })
  metadata: string;

  @Column({
    type: DataType.ARRAY(
      DataType.ENUM(
        DeliveryMethods.EMAIL,
        DeliveryMethods.SMS,
        DeliveryMethods.CALL,
        DeliveryMethods.PUSH,
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

  @Column({ allowNull: true })
  smsTemplate: string;

  @Column({ allowNull: true })
  callTemplate: string;

  @Column({ allowNull: true })
  pushTemplate: string;

  @Default(false)
  @Column
  checkDeliveryWindow: boolean;

  @Default(false)
  @Column
  bypassSubscriptions: boolean;

  @BelongsTo(() => DistributionEvent)
  event: DistributionEvent;
}
