import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { AudioSubido } from 'src/audio-upload/audio-upload.entity';

@Entity()
export class AnalisisAudio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  metrica: any; 

  @OneToOne(() => AudioSubido)
  @JoinColumn()
  audio: AudioSubido;
}