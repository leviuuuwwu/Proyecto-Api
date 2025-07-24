import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranscripcionService } from './transcripcion.service';
import { Transcripcion } from './transcripcion.entity';
import { HistorialProcesamiento } from '../historial/historial.entity';
import { HistorialService } from '../historial/historial.service';
import { AnalisisAudio } from '../audio-analisis/analisis-audio.entity';
import { AnalisisAudioService } from '../audio-analisis/analisis-audio.service';
import { TranscripcionController } from './transcripcion.controller';
import { PalabraClaveDetectada } from '../audio-analisis/palabra-clave.entity';
import { PalabraClaveService } from '../audio-analisis/palabra-clave.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transcripcion, HistorialProcesamiento, PalabraClaveDetectada, AnalisisAudio]),
  ],
  providers: [TranscripcionService, HistorialService, AnalisisAudioService, PalabraClaveService],
  controllers: [TranscripcionController],
  exports: [TranscripcionService],
})
export class TranscripcionModule {}