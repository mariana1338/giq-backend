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

  @Column()
  mensaje: string;

  @Column({ type: 'boolean', default: false })
  leida: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.notificaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(
    () => InstrumentoQuirurgico,
    (instrumento) => instrumento.notificaciones,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'id_instrumento' })
  instrumento: InstrumentoQuirurgico;
}
