import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoService } from './movimiento.service';
import { MovimientoController } from './movimiento.controller';
import { MovimientoInventario } from './entities/movimiento.entity';
import { InstrumentoQuirurgico } from '../instrumento-quirurgico/entities/instrumento-quirurgico.entity';
import { Usuario } from '../usuario/entities/usuario.entity'; // 🔑 Importamos la entidad Usuario

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MovimientoInventario,
      InstrumentoQuirurgico,
      Usuario, // 🔑 CORRECCIÓN: Registramos la entidad Usuario
    ]),
    // Si tu UsuarioModule exporta el TypeOrmModule.forFeature() para Usuario,
    // también podrías importar el UsuarioModule aquí, pero registrar la entidad
    // directamente es la solución más rápida para resolver la dependencia.
  ],
  controllers: [MovimientoController],
  providers: [MovimientoService],
})
export class MovimientoModule {}