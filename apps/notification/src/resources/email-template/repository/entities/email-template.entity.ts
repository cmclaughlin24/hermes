import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class EmailTemplate {
  @PrimaryColumn()
  name: string;

  @Column()
  subject: string;

  @Column({ length: 2000 })
  template: string;

  @Column({ type: 'simple-json', nullable: true })
  context: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

