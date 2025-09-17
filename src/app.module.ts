// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Importa los módulos
import { UsuarioModule } from './modules/usuario/usuario.module';
import { InstrumentoQuirurgicoModule } from './modules/instrumento-quirurgico/instrumento-quirurgico.module';
import { ProveedorModule } from './modules/proveedor/proveedor.module';
import { UbicacionAlmacenModule } from './modules/ubicacion-almacen/ubicacion-almacen.module';
import { CategoriaInstrumentoModule } from './modules/categoria-instrumento/categoria-instrumento.module';
import { NotificacionModule } from './modules/notificacion/notificacion.module';
import { VentaModule } from './modules/venta/venta.module';

// Importa todas las entidades
import { Usuario } from './modules/usuario/entities/usuario.entity';
import { InstrumentoQuirurgico } from './modules/instrumento-quirurgico/entities/instrumento-quirurgico.entity';
import { Proveedor } from './modules/proveedor/entities/proveedor.entity';
import { UbicacionAlmacen } from './modules/ubicacion-almacen/entities/ubicacion-almacen.entity';
import { CategoriaInstrumento } from './modules/categoria-instrumento/entities/categoria-instrumento.entity';
import { Notificacion } from './modules/notificacion/entities/notificacion.entity';
import { Venta } from './modules/venta/entities/venta.entity'; // 💡 Importa la entidad Venta

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          // Añade todas las entidades aquí
          Usuario,
          InstrumentoQuirurgico,
          Proveedor,
          UbicacionAlmacen,
          CategoriaInstrumento,
          Notificacion,
          Venta, // 💡 Añade la entidad Venta
        ],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    UsuarioModule,
    InstrumentoQuirurgicoModule,
    ProveedorModule,
    UbicacionAlmacenModule,
    CategoriaInstrumentoModule,
    NotificacionModule,
    VentaModule,
  ],
})
export class AppModule {}
