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
          `El correo electrónico '${createUsuarioDto.correo}' ya está registrado.`,
        );
      }

      const nuevoUsuario = this.usuarioRepository.create(createUsuarioDto);
      return await this.usuarioRepository.save(nuevoUsuario);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error al crear usuario:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al crear el usuario.',
      );
    }
  }

  async findAll(): Promise<Usuario[]> {
    try {
      return await this.usuarioRepository.find();
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al obtener los usuarios.',
      );
    }
  }

  async findOne(id_usuario: string): Promise<Usuario> {
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
    id_usuario: string,
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
          existingUserWithNewEmail.id_usuario !== id_usuario
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

  async remove(id_usuario: string): Promise<void> {
    const result = await this.usuarioRepository.delete(id_usuario);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Usuario con ID '${id_usuario}' no encontrado para eliminar.`,
      );
    }
  }
}
