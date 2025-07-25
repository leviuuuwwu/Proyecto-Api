import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { TranscripcionService } from './transcripcion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Transcripciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transcripciones')
export class TranscripcionController {
  constructor(private readonly transcripcionService: TranscripcionService) {}

  @Get()
  @Roles('usuario', 'admin')
  async obtenerTranscripciones(@Param('id') id: string) {
    return this.transcripcionService.obtenerTranscripcionesPorUsuario(id);
  }

  @Get(':id/exportar')
  @Roles('usuario', 'admin')
  async exportarPlano(@Param('id') id: string) {
    const transcripcion = await this.transcripcionService.obtenerPorIdConPalabrasClave(id);
    if (!transcripcion) {
      throw new NotFoundException('Transcripción no encontrada');
    }
    return this.transcripcionService.generarContenidoExportable(transcripcion);
  }
}