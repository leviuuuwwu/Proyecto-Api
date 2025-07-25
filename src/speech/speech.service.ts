import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as speech from '@google-cloud/speech';
import * as path from 'path';

@Injectable()
export class SpeechService {
  private client: speech.SpeechClient;

  constructor() {
    this.client = new speech.SpeechClient({
      keyFilename: path.resolve(
        process.cwd(),
        process.env.GOOGLE_APPLICATION_CREDENTIALS ??
          (() => {
            throw new Error('GOOGLE_APPLICATION_CREDENTIALS env variable is not set');
          })(),
      ),
    });
  }

  async transcribirAudio(
    gcsUri: string,
  ): Promise<{
    texto: string;
    palabrasConTimestamps: {
      palabra: string;
      inicio: number;
      fin: number;
      hablante: number | null;
    }[];
    cantidadHablantes: number;
    segmentosPorHablante: any[];
    palabrasCrudas: {
      word: string;
      startTime?: any;
      endTime?: any;
      speakerTag?: number;
    }[];
  }> {
    const audio = { uri: gcsUri };
    const config = {
      encoding: speech.protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
      diarizationConfig: {
        enableSpeakerDiarization: true,
        minSpeakerCount: 2,
        maxSpeakerCount: 2,
      },
    };
    const request = { audio, config };

    try {
      const [operation] = await this.client.longRunningRecognize(request);
      const [response] = await operation.promise();
      console.log('📄 RESPUESTA DE GOOGLE:', JSON.stringify(response, null, 2));

      // Buscar resultado con diarización
      const ultimaConDiarizacion = [...(response.results ?? [])]
        .reverse()
        .find(r => r.alternatives?.[0]?.words?.some(w => w.speakerTag));

      // Fallback: concatenar todos los transcripts
      const transcription =
        ultimaConDiarizacion?.alternatives?.[0]?.transcript ||
        (response.results ?? [])
          .map(r => r.alternatives?.[0]?.transcript || '')
          .join(' ');

      const palabras = ultimaConDiarizacion?.alternatives?.[0]?.words ?? [];

      // Agrupar por bloques de 2 segundos
      const bloques: {
        palabra: string;
        inicio: number;
        fin: number;
        hablante: number | null;
      }[] = [];

      let bloqueInicio = 0;
      let bloqueFin = 2;
      let textoActual = '';
      let hablanteActual = palabras[0]?.speakerTag || null;

      for (const word of palabras) {
        if (!word.word) continue;

        const start =
          Number(word.startTime?.seconds || 0) +
          Number(word.startTime?.nanos || 0) / 1e9;

        const end =
          Number(word.endTime?.seconds || 0) +
          Number(word.endTime?.nanos || 0) / 1e9;

        if (start > bloqueFin) {
          if (textoActual.trim()) {
            bloques.push({
              palabra: textoActual.trim(),
              inicio: Math.floor(bloqueInicio),
              fin: Math.floor(bloqueFin),
              hablante: hablanteActual,
            });
          }
          // Nuevo bloque
          bloqueInicio = bloqueFin;
          bloqueFin += 2;
          textoActual = '';
        }

        textoActual += word.word + ' ';
        hablanteActual = word.speakerTag || null;
      }

      // Push del último bloque
      if (textoActual.trim()) {
        bloques.push({
          palabra: textoActual.trim(),
          inicio: Math.floor(bloqueInicio),
          fin: Math.floor(bloqueFin),
          hablante: hablanteActual,
        });
      }

      const palabrasCrudas = palabras
        .filter(p => typeof p.word === 'string')
        .map(p => ({
          word: p.word!,
          startTime: p.startTime,
          endTime: p.endTime,
          speakerTag: typeof p.speakerTag === 'number' ? p.speakerTag : undefined,
        }));

      return {
        texto: transcription,
        palabrasConTimestamps: bloques,
        cantidadHablantes: new Set(palabras.map(p => p.speakerTag)).size,
        segmentosPorHablante: [], // opcional
        palabrasCrudas,
      };
    } catch (error) {
      console.error('❌ Error en transcripción:', error?.message || error);
      throw new InternalServerErrorException(
        error?.message || 'Error al transcribir el audio',
      );
    }
  }
}