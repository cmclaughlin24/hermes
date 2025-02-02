import { DeliveryMethods } from '@hermes/common';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { DistributionEvent } from '../../../distribution-event/repository/entities/distribution-event.entity';

@Entity()
@Unique(['distributionEventType', 'metadata'])
export class DistributionRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  distributionEventType: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: string;

  @Column({
    type: 'enum',
    enumName: 'deliveryMethods',
    enum: DeliveryMethods,
  })
  deliveryMethods: DeliveryMethods[];

  @Column({ nullable: true })
  emailSubject: string;

  @Column({ length: 2000, nullable: true })
  emailTemplate: string;

  @Column({ length: 2000, nullable: true })
  html: string;

  @Column()
  text: string;

  @Column({ nullable: true })
  smsTemplate: string;

  @Column({ nullable: true })
  callTemplate: string;

  @Column({ nullable: true })
  pushTemplate: string;

  @Column({ default: false })
  checkDeliveryWindow: boolean;

  @Column({ default: false })
  bypassSubscriptions: boolean;

  @ManyToOne(() => DistributionEvent, (event) => event.rules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'distributionEventType' })
  event: DistributionEvent;
}
