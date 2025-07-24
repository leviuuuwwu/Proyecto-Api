import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { TranscripcionService } from './transcripcion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Res as NestRes } from '@nestjs/common';

@ApiTags('Transcripciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transcripciones')
export class TranscripcionController {
  constructor(private readonly transcripcionService: TranscripcionService) {}

  @Get()
  @Roles('usuario', 'admin')
  async obtenerTranscripciones(@Req() req: any) {
    const userId = req.user.id;
    return this.transcripcionService.obtenerTranscripcionesPorUsuario(userId);
  }

  @Get(':id')
  @Roles('usuario', 'admin')
  async obtenerTranscripcion(@Param('id') id: string, @Req() req: any) {
    const transcripcion = await this.transcripcionService.obtenerPorId(id);
    if (!transcripcion) throw new NotFoundException('No encontrada');
    return transcripcion;
  }

  @Get(':id/exportar')
  async exportarTxt(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const transcripcion = await this.transcripcionService.obtenerPorIdConPalabrasClave(id);
    if (!transcripcion) {
      throw new NotFoundException('Transcripción no encontrada');
    }

    const contenido = this.transcripcionService.generarContenidoExportable(transcripcion);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="transcripcion-${id}.txt"`);
    return contenido;
  }
}

function Res(options?: { passthrough: boolean }) {
  return NestRes(options);
}
