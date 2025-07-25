import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalisisAudio } from './analisis-audio.entity';
import { AudioSubido } from 'src/audio-upload/audio-upload.entity';
import { Transcripcion } from 'src/transcripcion/transcripcion.entity';

@Injectable()
export class AnalisisAudioService {
  constructor(
    @InjectRepository(AnalisisAudio)
    private readonly repo: Repository<AnalisisAudio>,
  ) {}

  async analizar(transcripcion: Transcripcion): Promise<AnalisisAudio> {
    const palabras = transcripcion.palabrasConTimestamps ?? [];
    const duracionSegundos = palabras.length > 0
      ? palabras.at(-1).fin - palabras[0].inicio
      : 0;

    // Métricas de ejemplo, aquí puedes agregar más
    const metrica = {
      duracionSegundos,
      totalPalabras: palabras.length,
      velocidadHabla: palabras.length / (duracionSegundos || 1),
      pausasDetectadas: this.contarPausas(palabras),
    };

    const analisis = this.repo.create({
      metrica,
      transcripcion,
    });

    return this.repo.save(analisis);
  }

  private contarPausas(palabras: any[]): number {
    let pausas = 0;
    for (let i = 1; i < palabras.length; i++) {
      if (palabras[i].inicio - palabras[i - 1].fin > 1) pausas++;
    }
    return pausas;
  }
}