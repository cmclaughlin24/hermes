import { DeliveryMethods, PhoneMethods } from '@hermes/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PhoneTemplate {
  @PrimaryColumn()
  name: string;

  @Column({
    primary: true,
    type: 'enum',
    enumName: 'phone-methods',
    enum: [DeliveryMethods.CALL, DeliveryMethods.SMS],
  })
  deliveryMethod: PhoneMethods;

  @Column({ length: 2000 })
  template: string;

  @Column({ type: 'simple-json', nullable: true })
  context: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
