import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔐 Requiere autenticación y role admin (configurado en el guard)
  @Roles('admin')
  @Get()
  getAllUsers() {
    return this.usersService.findAll();
  }

  // ⚠️ IMPORTANTE: comentar o eliminar este endpoint después de usarlo
  @Post('init-admin')
  createInitialAdmin(@Body() body?: Partial<CreateUserDto>) {
    return this.usersService.create({
      fullName: body?.fullName || 'Admin Local',
      email: body?.email || 'admin@local.com',
      password: body?.password || 'admin123',
      role: 'admin',
    });
  }

  // Crear usuarios normalmente (público o protegido según tu lógica)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
