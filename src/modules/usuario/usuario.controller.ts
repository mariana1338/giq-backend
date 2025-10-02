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
  UseGuards, // Si vas a usar guardias de autenticación
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { LoginDto } from './dto/login.dto'; 
import { AuthService } from '../../auth/auth.service';  
import { AuthGuard } from '@nestjs/passport';


@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly authService: AuthService,
  ) {} 

  // =========================================================
  // ENDPOINT DE REGISTRO (SIGNUP)
  // Ruta: POST http://localhost:3000/usuarios
  // =========================================================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // Nota: El service se encargará del hashing de la contraseña
    return this.usuarioService.create(createUsuarioDto);
  }

  // =========================================================
  // ENDPOINT DE INICIO DE SESIÓN (LOGIN) ⬅️ AÑADIDO
  // Ruta: POST http://localhost:3000/usuarios/login
  // =========================================================
  @Post('login') 
 @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    // ⬅️ Llama al servicio de autenticación para obtener el token real
    const token = await this.authService.login(loginDto.email, loginDto.password); 

    if (!token) {
      // El AuthService lanza la UnauthorizedException si las credenciales fallan, 
      // pero si por alguna razón retorna null, lanzamos el error aquí.
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    return token;
  }

  // =========================================================
  // CRUD RESTANTE
  // =========================================================
  @Get()
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard) // ⬅️ Descomenta cuando implementes la guardia JWT
  async findAll(): Promise<Usuario[]> {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usuarioService.remove(id);
  }
}