import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialProcesamiento } from './historial.entity';
import { AudioSubido } from 'src/audio-upload/audio-upload.entity';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(HistorialProcesamiento)
    private historialRepo: Repository<HistorialProcesamiento>,
  ) {}

  async registrarEvento(
    audio: AudioSubido,
    tipo: 'SUBIDA' | 'TRANSCRIPCION' | 'ERROR',
    descripcion: string,
  ): Promise<HistorialProcesamiento> {
    const evento = this.historialRepo.create({ audio, tipo, descripcion });
    return this.historialRepo.save(evento);
  }

  async obtenerHistorial(audioId: string): Promise<HistorialProcesamiento[]> {
    return this.historialRepo.find({
      where: { audio: { id: audioId } },
      order: { creadoEn: 'ASC' },
    });
  }
}