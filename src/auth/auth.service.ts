import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
  const user = await this.usersService.findByEmail(email);
  console.log('Usuario encontrado:', user);
  if (!user) {
    console.log('No existe usuario con ese email');
    throw new UnauthorizedException('Credenciales inválidas');
  }

  console.log('Password enviado:', password);
  console.log('Password hash en DB:', user.password);

  const valid = await bcrypt.compare(password, user.password);
  console.log('Resultado bcrypt.compare:', valid);

  if (!valid) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}


  async login(user: any) {
    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}