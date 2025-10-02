// src/auth/auth.module.ts

import { Module, forwardRef  } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Necesario para leer .env
import { AuthService } from './auth.service';
import { UsuarioModule } from '../modules/usuario/usuario.module'; // Importa el módulo de usuarios
import { JwtStrategy } from './jwt.strategy';


@Module({
  imports: [
    forwardRef(() => UsuarioModule),
    
    // 2. Configurar Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // 3. Configurar el módulo JWT para firmar y verificar tokens
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // Es crucial usar una clave secreta fuerte y guardada en el .env
        secret: configService.get<string>('JWT_SECRET') || 'CLAVE_SECRETA_LARGA_MUY_COMPLEJA_PARA_GIQ_2025', 
        signOptions: { 
          expiresIn: '1h', // El token expira en 1 hora
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule, JwtStrategy], // Exporta para que otros módulos lo usen
})
export class AuthModule {}