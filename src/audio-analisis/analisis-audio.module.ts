import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PalabraClaveService } from './palabra-clave.service';
import { PalabraClaveDetectada } from './palabra-clave.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PalabraClaveDetectada])], // 👈 REGISTRO CORRECTO
  providers: [PalabraClaveService],
  exports: [PalabraClaveService],
})
export class AudioAnalisisModule {}
