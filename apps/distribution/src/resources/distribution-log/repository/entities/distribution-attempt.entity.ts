import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { DistributionLog } from './distribution-log.entity';

@Entity()
export class DistributionAttempt {
  @PrimaryColumn('uuid')
  logId: string;

  @PrimaryColumn()
  attempt: number;

  @Column()
  processedAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  result: any;

  @Column({ type: 'simple-json', nullable: true })
  error: any;

  @ManyToOne(() => DistributionLog, (log) => log.attemptHistory, {
    onDelete: 'CASCADE',
  })
  log: DistributionLog;
}
