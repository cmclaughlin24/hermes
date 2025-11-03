import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { DistributionLogEntity } from './distribution-log.entity';

@Entity()
export class DistributionAttemptEntity {
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

  @ManyToOne(() => DistributionLogEntity, (log) => log.attemptHistory, {
    onDelete: 'CASCADE',
  })
  log: DistributionLogEntity;
}
