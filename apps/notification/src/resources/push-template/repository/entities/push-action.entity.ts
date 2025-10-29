import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { PushTemplateEntity } from './push-template.entity';

@Entity()
export class PushActionEntity {
  @PrimaryColumn()
  action: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  icon: string;

  @ManyToOne(() => PushTemplateEntity, (template) => template.actions, {
    onDelete: 'CASCADE',
  })
  template: PushTemplateEntity;
}


