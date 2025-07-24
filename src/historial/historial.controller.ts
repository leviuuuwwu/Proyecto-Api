import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Historial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('historial')
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Get(':audioId')
  @Roles('usuario', 'admin')
  async obtenerHistorial(@Param('audioId') audioId: string) {
    const historial = await this.historialService.obtenerHistorial(audioId);
    if (!historial || historial.length === 0) {
      throw new NotFoundException('No hay historial para este audio');
    }
    return historial;
  }
}