import { Module, forwardRef  } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from './entities/usuario.entity';
import { AuthModule } from '../../auth/auth.module'; // ⬅️ Importa el AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    forwardRef(() => AuthModule),
    // 1. IMPORTAR AUTHMODULE: Esto permite que UsuarioController use AuthService.
    AuthModule, 
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [
    // 2. EXPORTAR DEPENDENCIAS: El AuthModule necesita el TypeOrmModule.forFeature([Usuario])
    //    y el UsuarioService para poder validar usuarios en el AuthService.
    UsuarioService,
    TypeOrmModule, 
  ],
})
export class UsuarioModule {}
