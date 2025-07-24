import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as speech from '@google-cloud/speech';
import * as path from 'path';

@Injectable()
export class SpeechService {
  private client: speech.SpeechClient;

  constructor() {
    this.client = new speech.SpeechClient({
      keyFilename: path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS ?? (() => { throw new Error('GOOGLE_APPLICATION_CREDENTIALS env variable is not set'); })()),
    });
  }

  async transcribirAudio(gcsUri: string): Promise<{
    texto: string;
    palabrasConTimestamps: {
      palabra: string;
      inicio: number;
      fin: number;
      hablante: number | null;
    }[];
    cantidadHablantes: number;
  }> {
    const audio = { uri: gcsUri };

    const config = {
      encoding: speech.protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
      enableSpeakerDiarization: true,
      diarizationSpeakerCount: 2,
    };

    const request = { audio, config };

    try {
      const [operation] = await this.client.longRunningRecognize(request);
      const [response] = await operation.promise();
      console.log('📄 RESPUESTA DE GOOGLE:', JSON.stringify(response, null, 2));

      const palabrasConTimestamps: {
        palabra: string;
        inicio: number;
        fin: number;
        hablante: number | null;
      }[] = [];

      const transcription = (response.results ?? [])
        .map(result => result.alternatives?.[0]?.transcript || '')
        .join(' ');

      response.results?.forEach(result => {
        const words = result.alternatives?.[0]?.words;
        words?.forEach(wordInfo => {
          palabrasConTimestamps.push({
            palabra: wordInfo.word ?? '',
            inicio: Number(wordInfo.startTime?.seconds || 0),
            fin: Number(wordInfo.endTime?.seconds || 0),
            hablante: wordInfo.speakerTag || null,
          });
        });
      });

      return {
        texto: transcription,
        palabrasConTimestamps,
        cantidadHablantes: config.diarizationSpeakerCount,
      };
    } catch (error) {
      console.error('❌ Error en transcripción:', error?.message || error);
      throw new InternalServerErrorException(error?.message || 'Error al transcribir el audio');
    }
  }
}