import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { NotificationLog } from './notification-log.entity';

@Entity()
export class NotificationAttempt {
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

  @ManyToOne(() => NotificationLog, (log) => log.attemptHistory)
  @JoinColumn({ name: 'logId' })
  log: NotificationLog;
}

