// src/modules/usuario/usuario.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException, 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; 
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
// No necesitamos importar ChangePasswordDto aquí, ya que los datos se pasan directamente.

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  // ----------------------------------------------------
  // 1. REGISTRO (CREATE)
  // ----------------------------------------------------
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
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUsuarioDto.password, salt);
      
      const newUsuario = this.usuarioRepository.create({
          ...createUsuarioDto, 
          password: hashedPassword,
      });   
      
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

  // ----------------------------------------------------
  // 2. INICIO DE SESIÓN (LOGIN)
  // ----------------------------------------------------
  async validateUser(email: string, pass: string): Promise<any> {
    const usuario = await this.usuarioRepository.findOne({ 
        where: { correo: email },
        select: ['id_usuario', 'correo', 'password', 'rol', 'nombre'], // Incluir 'nombre' para JWT/Perfil
    });
    
    if (!usuario) { return null; }

    const isPasswordValid = await bcrypt.compare(pass, usuario.password); 

    if (!isPasswordValid) { return null; }
    
    // Retorna el objeto usuario (sin la contraseña)
    const { password, ...result } = usuario;
    console.log(`[USUARIO SERVICE] Usuario validado:`, result.correo, result.rol);
    return result; 
  }
  
  // ----------------------------------------------------
  // 3. CRUD RESTANTE Y PERFIL
  // ----------------------------------------------------

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async findOne(id_usuario: number): Promise<Usuario> {
    // Asegúrate de NO seleccionar el campo 'password' aquí, a menos que sea estrictamente necesario.
    const usuario = await this.usuarioRepository.findOne({
        where: { id_usuario },
        // Excluimos la contraseña al buscar el perfil
        select: ['id_usuario', 'nombre', 'correo', 'rol'] as (keyof Usuario)[], 
    });
    if (!usuario) {
        throw new NotFoundException(`Usuario con ID '${id_usuario}' no encontrado.`);
    }
    return usuario;
  }

  /**
   * Actualiza la información básica del usuario (usado por PATCH /usuarios/perfil)
   * Nota: Este método no maneja el cambio de contraseña directamente, sino otros campos.
   */
  async update(
    id_usuario: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    try {
      const usuario = await this.usuarioRepository.findOne({ 
        where: { id_usuario } 
      }); // Traemos el usuario original

      if (!usuario) {
        throw new NotFoundException(`Usuario con ID '${id_usuario}' no encontrado.`);
      }
      
      // Si se está actualizando el correo, verificar que no esté en uso por otro
      if (updateUsuarioDto.correo && updateUsuarioDto.correo !== usuario.correo) {
          const existingUser = await this.usuarioRepository.findOneBy({ correo: updateUsuarioDto.correo });
          if (existingUser) {
              throw new ConflictException(`El correo electrónico '${updateUsuarioDto.correo}' ya está en uso.`);
          }
      }

      // NO permitir actualización de contraseña aquí. Debe ir al changePassword.
      delete updateUsuarioDto.password; 

      this.usuarioRepository.merge(usuario, updateUsuarioDto);
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
        if (error instanceof NotFoundException || error instanceof ConflictException) {
            throw error;
        }
        console.error(`Error al actualizar usuario con ID ${id_usuario}:`, error);
        throw new InternalServerErrorException('Ocurrió un error inesperado al actualizar el usuario.');
    }
  }

  /**
   * 🔑 Método para cambiar la contraseña del usuario actual.
   * Usado por PATCH /usuarios/cambiar-password.
   */
  async changePassword(
    id_usuario: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // 1. Buscar el usuario y obtener su contraseña hasheada
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario },
      select: ['id_usuario', 'password'], // Solo necesitamos el ID y la contraseña
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID '${id_usuario}' no encontrado.`);
    }

    // 2. Verificar la contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      usuario.password,
    );

    if (!isCurrentPasswordValid) {
      // Usamos UnauthorizedException para que el frontend sepa que la credencial es incorrecta
      throw new UnauthorizedException('La contraseña actual proporcionada es incorrecta.');
    }

    // 3. Hashear y actualizar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizamos solo el campo de la contraseña
    usuario.password = hashedPassword;
    
    try {
      await this.usuarioRepository.save(usuario);
    } catch (error) {
      console.error(`Error al guardar la nueva contraseña para el usuario ${id_usuario}:`, error);
      throw new InternalServerErrorException('Error al actualizar la contraseña en la base de datos.');
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