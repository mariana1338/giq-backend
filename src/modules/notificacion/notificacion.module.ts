// src/modules/notificacion/notificacion.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionService } from './notificacion.service';
import { NotificacionController } from './notificacion.controller';
import { Notificacion } from './entities/notificacion.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { InstrumentoQuirurgico } from '../instrumento-quirurgico/entities/instrumento-quirurgico.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion, Usuario, InstrumentoQuirurgico]),
  ],
  controllers: [NotificacionController],
  providers: [NotificacionService],
  exports: [NotificacionService],
})
export class NotificacionModule {}
