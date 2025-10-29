import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { NotificationLogEntity } from './notification-log.entity';

@Entity()
export class NotificationAttemptEntity {
  @PrimaryColumn()
  logId: string;

  @PrimaryColumn()
  attempt: number;

  @Column()
  processedAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  result: any;

  @Column({ type: 'simple-json', nullable: true })
  error: any;

  @ManyToOne(() => NotificationLogEntity, (log) => log.attemptHistory)
  @JoinColumn({ name: 'logId' })
  log: NotificationLogEntity;
}
