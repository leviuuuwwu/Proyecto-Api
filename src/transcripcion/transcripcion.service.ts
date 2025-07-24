import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transcripcion } from './transcripcion.entity';
import { AudioSubido } from '../audio-upload/audio-upload.entity';
import { HistorialService } from '../historial/historial.service';
import { PalabraClaveDetectada } from '../audio-analisis/palabra-clave.entity';

@Injectable()
export class TranscripcionService {
constructor(
  private readonly historialService: HistorialService,

  @InjectRepository(Transcripcion)
  private readonly transcripcionRepo: Repository<Transcripcion>,

  @InjectRepository(PalabraClaveDetectada)
  private readonly palabraRepo: Repository<PalabraClaveDetectada>,
) {}

async detectarPalabrasClave(transcripcion: Transcripcion, keywords: string[]) {
  const palabrasDetectadas: PalabraClaveDetectada[] = [];

  for (const palabra of transcripcion.palabrasConTimestamps) {
    if (keywords.includes(palabra.word.toLowerCase())) {
      palabrasDetectadas.push(
        this.palabraRepo.create({
          palabra: palabra.word,
          timestamp: palabra.startTime,
          transcripcion,
        }),
      );
    }
  }

  await this.palabraRepo.save(palabrasDetectadas);
  return palabrasDetectadas;
}

  async registrarEvento(
    audio: AudioSubido,
    tipo: 'SUBIDA' | 'TRANSCRIPCION' | 'ERROR',
    descripcion: string,
  ) {
    return this.historialService.registrarEvento(audio, tipo, descripcion);
  }

  async obtenerTranscripcionesPorUsuario(userId: string) {
  return this.transcripcionRepo.find({
    where: {
      audio: {
        usuario: {
          id: userId,
        },
      },
    },
    relations: ['audio'],
    order: { id: 'DESC' },
  });
  }

async obtenerPorId(id: string) {
  return this.transcripcionRepo.findOne({
    where: { id },
    relations: ['audio'],
  });
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