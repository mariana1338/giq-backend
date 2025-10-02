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

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  // ----------------------------------------------------
  // 1. REGISTRO (CREATE) - Usa DTO.password y guarda en Entity.password
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
      // El DTO.password se hashea
      const hashedPassword = await bcrypt.hash(createUsuarioDto.password, salt);
      
      const newUsuario = this.usuarioRepository.create({
          ...createUsuarioDto, 
          password: hashedPassword, // ⬅️ Guarda en Entity.password
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
  // 2. INICIO DE SESIÓN (LOGIN) - Usa Entity.password para comparación
  // ----------------------------------------------------
 // Nuevo método para que lo use el AuthService.
  async validateUser(email: string, pass: string): Promise<any> {
    const usuario = await this.usuarioRepository.findOne({ 
        where: { correo: email },
        select: ['id_usuario', 'correo', 'password', 'rol'],
    });
    
    if (!usuario) { return null; }

    const isPasswordValid = await bcrypt.compare(pass, usuario.password); 

    if (!isPasswordValid) { return null; }
    
    // Retorna el objeto usuario (sin la contraseña)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = usuario;
    console.log(`[USUARIO SERVICE] Usuario validado:`, result.correo, result.rol); // ⬅️ AÑADE ESTO
    return result; 
  }
  
  // ----------------------------------------------------
  // 3. CRUD RESTANTE (Ajustes menores)
  // ----------------------------------------------------

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async findOne(id_usuario: number): Promise<Usuario> {
    // ... (El resto de findOne es el mismo)
    const usuario = await this.usuarioRepository.findOne({
        where: { id_usuario },
    });
    if (!usuario) {
        throw new NotFoundException(`Usuario con ID '${id_usuario}' no encontrado.`);
    }
    return usuario;
  }

  async update(
    id_usuario: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    try {
      const usuario = await this.findOne(id_usuario);
      
      // ... (Lógica de validación de correo duplicado es la misma)

      // Lógica para hashear la nueva contraseña si se proporciona
      if (updateUsuarioDto.password) {
          const salt = await bcrypt.genSalt(10);
          updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, salt);
      }

      this.usuarioRepository.merge(usuario, updateUsuarioDto);
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
        // ... (manejo de errores)
        if (error instanceof NotFoundException || error instanceof ConflictException) {
            throw error;
        }
        console.error(`Error al actualizar usuario con ID ${id_usuario}:`, error);
        throw new InternalServerErrorException('Ocurrió un error inesperado al actualizar el usuario.');
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
