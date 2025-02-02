import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MessageState } from '../../../../common/types/message-state.type';
import { DistributionAttempt } from './distribution-attempt.entity';

@Entity()
export class DistributionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventType: string;

  @Column({
    type: 'enum',
    enumName: 'message-state',
    enum: MessageState,
  })
  state: MessageState;

  @Column()
  attempts: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: string;

  @Column({ type: 'simple-json', nullable: true })
  data: string;

  @Column()
  addedAt: Date;

  @Column({ nullable: true })
  finishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DistributionAttempt, (attempt) => attempt.log, {
    cascade: true,
  })
  attemptHistory: DistributionAttempt[];
}
