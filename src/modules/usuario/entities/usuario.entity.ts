import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Notificacion } from '../../notificacion/entities/notificacion.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ nullable: false })
  nombre: string;
  

  @Column({ unique: true, nullable: false })
  correo: string;

  @Column({ nullable: false, select: false }) // ⬅️ OPTIONAL: Añade select: false para más seguridad
  password: string; // ⬅️ CAMBIADO DE 'contraseña' A 'password'

  @Column({ nullable: false })
  rol: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  // Relación Uno a Muchos con Notificacion
  @OneToMany(() => Notificacion, (notificacion) => notificacion.usuario)
  notificaciones: Notificacion[];
}
