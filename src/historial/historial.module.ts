import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialProcesamiento } from './historial.entity';
import { HistorialService } from './historial.service';
import { HistorialController } from './historial.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialProcesamiento])],
  providers: [HistorialService],
  controllers: [HistorialController],
  exports: [HistorialService],
})
export class HistorialModule {}