import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transcripcion } from './transcripcion.entity';
import { AudioSubido } from '../audio-upload/audio-upload.entity';
import { HistorialProcesamiento } from './historial.entity';


@Injectable()
export class TranscripcionService {
  constructor(
    @InjectRepository(Transcripcion)
    private historialRepo: Repository<HistorialProcesamiento>,
    private transcripcionRepo: Repository<Transcripcion>,
  ) {}

   async registrarEvento(audio: AudioSubido, tipo: 'SUBIDA' | 'TRANSCRIPCION' | 'ERROR', descripcion: string) {
    const evento = this.historialRepo.create({ audio, tipo, descripcion });
    return this.historialRepo.save(evento);
  }

  async crearDesdeSpeech(
    texto: string,
    palabrasConTimestamps: any,
    cantidadHablantes: number,
    audio: AudioSubido,
  ) {
    const nueva = this.transcripcionRepo.create({
      texto,
      palabrasConTimestamps,
      cantidadHablantes,
      audio,
    });
    return this.transcripcionRepo.save(nueva);
  }
}
