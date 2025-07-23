import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { AudioSubido } from 'src/audio-upload/audio-upload.entity';

@Entity()
export class HistorialProcesamiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tipo: 'SUBIDA' | 'TRANSCRIPCION' | 'ERROR';

  @Column('text')
  descripcion: string;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => AudioSubido, audio => audio.transcripciones)
  audio: AudioSubido;
} 