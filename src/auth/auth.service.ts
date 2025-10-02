// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../modules/usuario/usuario.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService, // ⬅️ Inyectado del AuthModule
  ) {
    // ⬅️ Log para verificar la inyección
    if (!this.jwtService) {
        console.error("❌ ERROR CRÍTICO: JwtService NO se inyectó correctamente.");
    } else {
        console.log("✅ AuthService: JwtService disponible.");
    }
  }

  /**
   * 1. Valida las credenciales llamando al UsuarioService
   * 2. Si son válidas, genera y retorna el JWT.
   */
  async login(email: string, pass: string): Promise<{ access_token: string }> {
    // 1. La validación se hace en el UsuarioService (validateUser)
    const user = await this.usuarioService.validateUser(email, pass);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas (correo o contraseña incorrectos).');
    }
    
    // 2. Definir los datos que irán dentro del token (payload)
    const payload = { 
        email: user.correo, 
        sub: user.id_usuario,
        rol: user.rol,
    };
    const token = this.jwtService.sign(payload);

    
    // ⬅️ Si el token es nulo o vacío, devolverá un objeto vacío al frontend.
    if (!token) {
        console.error("❌ FALLO AL GENERAR JWT: El token es nulo/vacío. Revisa la clave secreta.");
    }
    // 3. Firmar el token y retornar en el formato esperado por el frontend
    return {
      access_token: token,
    };
  }
}