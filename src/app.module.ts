import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Importa todos tus módulos y entidades aquí
import { InstrumentoQuirurgicoModule } from './modules/instrumento-quirurgico/instrumento-quirurgico.module';
import { CategoriaInstrumentoModule } from './modules/categoria-instrumento/categoria-instrumento.module';
import { ProveedorModule } from './modules/proveedor/proveedor.module';
import { UbicacionAlmacenModule } from './modules/ubicacion-almacen/ubicacion-almacen.module';
import { UsuarioModule } from './modules/usuario/usuario.module';

import { InstrumentoQuirurgico } from './modules/instrumento-quirurgico/entities/instrumento-quirurgico.entity';
import { CategoriaInstrumento } from './modules/categoria-instrumento/entities/categoria-instrumento.entity';
import { Proveedor } from './modules/proveedor/entities/proveedor.entity';
import { UbicacionAlmacen } from './modules/ubicacion-almacen/entities/ubicacion-almacen.entity';
import { Usuario } from './modules/usuario/entities/usuario.entity'; // <-- ¡Importa la entidad Usuario!

@Module({
  imports: [
    // Configura ConfigModule para cargar variables de entorno desde .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Configura TypeOrmModule para la conexión a la base de datos MySQL
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
          // ¡Asegúrate de listar TODAS tus entidades aquí para que TypeORM las reconozca!
          InstrumentoQuirurgico,
          CategoriaInstrumento,
          Proveedor,
          UbicacionAlmacen,
          Usuario, // <-- ¡Agrega la entidad Usuario aquí!
        ],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    // Importa todos los módulos de tus entidades aquí
    InstrumentoQuirurgicoModule,
    CategoriaInstrumentoModule,
    ProveedorModule,
    UbicacionAlmacenModule,
    UsuarioModule,
  ],
})
export class AppModule {}
