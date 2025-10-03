// src/modules/usuario/usuario.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  UnauthorizedException,
  UseGuards,
  Request, // 🔑 Importar Request para acceder al usuario del JWT
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { LoginDto } from './dto/login.dto'; 
import { AuthService } from '../../auth/auth.service'; 
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto'; // 🔑 DTO para cambiar la contraseña

@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly authService: AuthService,
  ) {} 

  // =========================================================
  // ENDPOINT DE REGISTRO (SIGNUP)
  // =========================================================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    return this.usuarioService.create(createUsuarioDto);
  }

  // =========================================================
  // ENDPOINT DE INICIO DE SESIÓN (LOGIN)
  // =========================================================
  @Post('login') 
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    const token = await this.authService.login(loginDto.email, loginDto.password); 

    if (!token) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    return token;
  }

  // =========================================================
  // 🔑 ENDPOINTS DE PERFIL (REQUIERE JWT)
  // =========================================================

  /**
   * Obtiene la información del usuario autenticado (usado en el lado izquierdo del perfil).
   * Ruta: GET /usuarios/perfil
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('perfil')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: any): Promise<Usuario> {
    // req.user contiene el payload del token JWT (ej: { userId: 5, email: '...' })
    // Asumimos que el payload tiene una propiedad 'userId' o 'id_usuario'
    const userId = req.user.id_usuario || req.user.userId;
    
    // Devolvemos el usuario completo sin la contraseña
    return this.usuarioService.findOne(userId); 
  }

  /**
   * Actualiza la información básica del usuario (nombre, email).
   * Ruta: PATCH /usuarios/perfil
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('perfil')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Request() req: any,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const userId = req.user.id_usuario || req.user.userId;
    // El servicio debe manejar la actualización del usuario por su ID
    return this.usuarioService.update(userId, updateUsuarioDto);
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * Ruta: PATCH /usuarios/cambiar-password
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('cambiar-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const userId = req.user.id_usuario || req.user.userId;

    // 🔑 El servicio debe verificar la contraseña actual antes de actualizar la nueva
    await this.usuarioService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
    
    return { message: 'Contraseña actualizada correctamente.' };
  }

  // =========================================================
  // CRUD RESTANTE (Requiere autenticación en producción)
  // =========================================================
  @UseGuards(AuthGuard('jwt')) // 🔑 Añadimos el guardia a findAll
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Usuario[]> {
    return this.usuarioService.findAll();
  }
  // ... (El resto del CRUD queda igual)
}