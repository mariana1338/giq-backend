// src/modules/movimiento/entities/movimiento.entity.ts (Corregido y Optimizado)

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { InstrumentoQuirurgico } from '../../instrumento-quirurgico/entities/instrumento-quirurgico.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn()
  id_movimiento: number;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'varchar', length: 10 }) // Limita el tamaño de la cadena
  tipo_movimiento: string; // 'entrada' o 'salida'

  // 🔑 CORRECCIÓN/VERIFICACIÓN DE PRECIO: Aseguramos el tipo decimal si usas centavos.
  // Si solo usas enteros, 'int' está bien, pero 'decimal' es más seguro para dinero.
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number; // Precio de la transacción (unitario * cantidad)

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;

  // RELACIONES (Estas parecen correctas con los nombres de columna que definiste en la DB)

  @ManyToOne(() => Usuario, { eager: true, nullable: false }) // nullable: false para asegurar FK
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => InstrumentoQuirurgico, { eager: true, nullable: false }) // nullable: false para asegurar FK
  @JoinColumn({ name: 'id_instrumento' })
  instrumento: InstrumentoQuirurgico;
}