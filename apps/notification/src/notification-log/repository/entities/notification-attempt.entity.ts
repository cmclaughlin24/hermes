import { AutoMap } from '@automapper/classes';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { NotificationLogEntity } from './notification-log.entity';

@Entity()
export class NotificationAttemptEntity {
  @AutoMap()
  @PrimaryColumn()
  logId: string;

  @AutoMap()
  @PrimaryColumn()
  attempt: number;

  @AutoMap()
  @Column()
  processedAt: Date;

  @AutoMap()
  @Column({ type: 'simple-json', nullable: true })
  result: any;

  @AutoMap()
  @Column({ type: 'simple-json', nullable: true })
  error: any;

  @AutoMap(() => NotificationLogEntity)
  @ManyToOne(() => NotificationLogEntity, (log) => log.attemptHistory)
  @JoinColumn({ name: 'logId' })
  log: NotificationLogEntity;
}
