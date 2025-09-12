// src/modules/usuario/usuario.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    try {
      const existingUser = await this.usuarioRepository.findOne({
        where: { correo: createUsuarioDto.correo },
      });
      if (existingUser) {
        throw new ConflictException(
          `El correo electrónico '${createUsuarioDto.correo}' ya está en uso.`,
        );
      }
      const newUsuario = this.usuarioRepository.create(createUsuarioDto);
      return await this.usuarioRepository.save(newUsuario);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al crear el usuario.',
      );
    }
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async findOne(id_usuario: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario },
    });
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID '${id_usuario}' no encontrado.`,
      );
    }
    return usuario;
  }

  async update(
    id_usuario: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    try {
      const usuario = await this.findOne(id_usuario);

      if (
        updateUsuarioDto.correo &&
        updateUsuarioDto.correo !== usuario.correo
      ) {
        const existingUserWithNewEmail = await this.usuarioRepository.findOne({
          where: { correo: updateUsuarioDto.correo },
        });
        if (
          existingUserWithNewEmail &&
          existingUserWithNewEmail.id_usuario !== usuario.id_usuario
        ) {
          throw new ConflictException(
            `El correo electrónico '${updateUsuarioDto.correo}' ya está en uso por otro usuario.`,
          );
        }
      }

      this.usuarioRepository.merge(usuario, updateUsuarioDto);
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error(`Error al actualizar usuario con ID ${id_usuario}:`, error);
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al actualizar el usuario.',
      );
    }
  }

  async remove(id_usuario: number): Promise<void> {
    const result = await this.usuarioRepository.delete(id_usuario);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Usuario con ID '${id_usuario}' no encontrado para eliminar.`,
      );
    }
  }
}
