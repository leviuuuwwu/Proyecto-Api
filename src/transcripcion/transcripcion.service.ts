import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transcripcion } from './transcripcion.entity';
import { AudioSubido } from '../audio-upload/audio-upload.entity';
import { HistorialService } from '../historial/historial.service';
import { PalabraClaveService } from '../audio-analisis/palabra-clave.service'; // ✅ Importa el servicio
import { AnalisisAudioService } from '../audio-analisis/analisis-audio.service'; // <-- Importa el servicio de análisis

@Injectable()
export class TranscripcionService {
  constructor(
    private readonly historialService: HistorialService,

    @InjectRepository(Transcripcion)
    private readonly transcripcionRepo: Repository<Transcripcion>,

    private readonly palabraClaveService: PalabraClaveService, // ✅ Inyectado correctamente

    private readonly analisisAudioService: AnalisisAudioService, // <-- Inyecta el servicio de análisis
  ) {}

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

  async obtenerPorIdConPalabrasClave(id: string) {
  return this.transcripcionRepo.findOne({
    where: { id },
    relations: ['audio', 'palabrasClave'],
  });
}

  generarContenidoExportable(transcripcion: Transcripcion): string {
  const encabezado = `🎙️ TRANSCRIPCIÓN - ${new Date(transcripcion.creadoEn).toLocaleString()}\n`;
  const usuario = transcripcion.audio?.usuario?.id || 'Desconocido';
  const info = `Usuario: ${usuario}\nAudio: ${transcripcion.audio.url}\n\n`;

  const textoPlano = `📝 Texto completo:\n${transcripcion.texto}\n\n`;

  const palabrasClave = transcripcion.palabrasClave?.length
    ? `🔍 Palabras Clave Detectadas:\n${transcripcion.palabrasClave
        .map((p) => `- ${p.palabra} (en ${p.timestamp}s)`)
        .join('\n')}\n\n`
    : '🔍 Palabras Clave: No se detectaron.\n\n';

  const segmentos = transcripcion.segmentosPorHablante?.length
    ? `🎭 Segmentos por Hablante:\n${transcripcion.segmentosPorHablante
        .map(
          (s) =>
            `🧑‍💼 Hablante ${s.speaker} (de ${s.inicio}s a ${s.fin}s): ${s.texto}`,
        )
        .join('\n')}\n`
    : '';

  return encabezado + info + textoPlano + palabrasClave + segmentos;
}

async crearDesdeSpeech(
  texto: string,
  palabrasConTimestamps: any[],
  cantidadHablantes: number,
  segmentosPorHablante: {
    speaker: number;
    inicio: number;
    fin: number;
    texto: string;
  }[],
  audio: AudioSubido,
  palabrasClave: string[] = [],
) {
  const nueva = this.transcripcionRepo.create({
    texto,
    palabrasConTimestamps,
    cantidadHablantes,
    segmentosPorHablante,
    audio,
  });
  const transcripcion = await this.transcripcionRepo.save(nueva);

  // Elimina esta línea para evitar duplicados:
  // await this.palabraClaveService.detectar(palabrasConTimestamps, transcripcion, palabrasClave);

  await this.analisisAudioService.analizar(transcripcion);

  return transcripcion;
}
}