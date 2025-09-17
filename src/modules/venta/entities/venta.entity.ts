// src/modules/venta/entities/venta.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { InstrumentoQuirurgico } from '../../instrumento-quirurgico/entities/instrumento-quirurgico.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id_venta: number;

  @Column({ type: 'int', nullable: false })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  precio: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  // Relación Muchos a Uno con Usuario
  @ManyToOne(() => Usuario, (usuario) => usuario.ventas)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  // Relación Muchos a Uno con InstrumentoQuirurgico
  @ManyToOne(() => InstrumentoQuirurgico, (instrumento) => instrumento.ventas)
  @JoinColumn({ name: 'id_instrumento_quirurgico' })
  instrumento: InstrumentoQuirurgico;
}
