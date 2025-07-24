import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialProcesamiento } from './historial.entity';
import { HistorialService } from './historial.service';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialProcesamiento])],
  providers: [HistorialService],
  exports: [HistorialService],
})
export class HistorialModule {}
