import { AutoMap } from '@automapper/classes';
import { DeliveryMethods, PhoneMethods } from '@hermes/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PhoneTemplateEntity {
  @AutoMap()
  @PrimaryColumn()
  name: string;

  @AutoMap()
  @Column({
    primary: true,
    type: 'enum',
    enumName: 'phone-methods',
    enum: [DeliveryMethods.CALL, DeliveryMethods.SMS],
  })
  deliveryMethod: PhoneMethods;

  @AutoMap()
  @Column({ length: 2000 })
  template: string;

  @AutoMap()
  @Column({ type: 'simple-json', nullable: true })
  context: string;

  @AutoMap()
  @CreateDateColumn()
  createdAt: Date;

  @AutoMap()
  @UpdateDateColumn()
  updatedAt: Date;
}
