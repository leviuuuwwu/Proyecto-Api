import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { AudioUploadService } from './audio-upload.service';
import { User } from '../users/user.entity';

@ApiTags('Audios')
@ApiBearerAuth()
@Controller('upload-audio')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AudioUploadController {
  constructor(private readonly audioUploadService: AudioUploadService) {}

  @Post()
  @Roles('usuario', 'admin')
  @UseInterceptors(FileInterceptor('audio'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: { type: 'string', format: 'binary' },
        palabrasClaveDelCliente: { type: 'string', example: '["important","contacting","us"]' },
      },
    },
  })
  async subirAudio(
  @UploadedFile() file: Express.Multer.File,
  @Req() req: any,
  @Body('palabrasClaveDelCliente') palabrasClaveDelClienteRaw: string,
) {
  console.log('🔹 palabrasClaveDelClienteRaw recibidas:', palabrasClaveDelClienteRaw);

  if (!file) {
    throw new HttpException('Archivo no enviado', HttpStatus.BAD_REQUEST);
  }

  const usuario: User = req.user;
  if (!usuario || !usuario.id) {
    throw new HttpException('Usuario no autenticado correctamente', HttpStatus.UNAUTHORIZED);
  }

  let palabrasClave: string[] = [];

  try {
    if (palabrasClaveDelClienteRaw) {
      palabrasClave = JSON.parse(palabrasClaveDelClienteRaw);
    }
  } catch (err) {
    console.warn('⚠️ No se pudo parsear palabrasClaveDelCliente:', palabrasClaveDelClienteRaw);
  }

  console.log('🔹 palabrasClave parseadas:', palabrasClave);

  const { url, transcripcion } = await this.audioUploadService.uploadAudio(
    file,
    usuario,
    palabrasClave,
  );

  return {
    mensaje: 'Audio subido y transcrito exitosamente',
    url,
    transcripcion,
  };
}
}