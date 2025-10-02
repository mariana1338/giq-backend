// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // 1. Dónde buscar el token (Header 'Authorization: Bearer ...')
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Clave secreta para verificar la firma
      secretOrKey: 
        configService.get<string>('JWT_SECRET') || 'CLAVE_SECRETA_LARGA_MUY_COMPLEJA_PARA_GIQ_2025',
      ignoreExpiration: false,
    });
  }

  // 3. Este método se ejecuta DESPUÉS de validar la firma
  // y devuelve el objeto que se inyectará en req.user
  async validate(payload: JwtPayload) {
    // Aquí podrías buscar el usuario en la DB, pero por simplicidad,
    // devolvemos directamente el payload (id, email, rol)
    return { 
      userId: payload.sub, 
      email: payload.email, 
      rol: payload.rol 
    };
  }
}