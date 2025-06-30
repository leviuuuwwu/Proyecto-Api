import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find();
    return plainToInstance(User, users); 
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(newUser);
    return plainToInstance(User, saved);
  }
}