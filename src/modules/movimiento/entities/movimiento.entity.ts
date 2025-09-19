// src/modules/movimiento/entities/movimiento.entity.ts
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

  @Column({ type: 'varchar' })
  tipo_movimiento: string; // 'entrada' o 'salida'

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => InstrumentoQuirurgico, { eager: true })
  @JoinColumn({ name: 'id_instrumento' })
  instrumento: InstrumentoQuirurgico;

  @Column('int')
  precio: number;
}
