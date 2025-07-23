import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpeechService } from './speech.service';
import { TranscripcionService } from './transcripcion.service';
import { Transcripcion } from './transcripcion.entity';
import { HistorialProcesamiento } from '../historial/historial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transcripcion, HistorialProcesamiento])],
  providers: [SpeechService, TranscripcionService],
  exports: [SpeechService, TranscripcionService],
})
export class TranscripcionModule {}