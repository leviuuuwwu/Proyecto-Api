import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Transcripcion } from 'src/transcripcion/transcripcion.entity';

@Entity()
export class AnalisisAudio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  metrica: any;

  @OneToOne(() => Transcripcion, transcripcion => transcripcion.analisis, { onDelete: 'CASCADE' })
  @JoinColumn()
  transcripcion: Transcripcion;
}