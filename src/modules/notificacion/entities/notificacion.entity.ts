// src/modules/notificacion/entities/notificacion.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { InstrumentoQuirurgico } from '../../instrumento-quirurgico/entities/instrumento-quirurgico.entity';

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id_notificacion: number;

  @Column({ nullable: false })
  mensaje: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.notificaciones)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(
    () => InstrumentoQuirurgico,
    (instrumento) => instrumento.notificaciones,
  )
  @JoinColumn({ name: 'id_producto' }) // El nombre de la columna es 'id_producto'
  instrumento: InstrumentoQuirurgico;
}
