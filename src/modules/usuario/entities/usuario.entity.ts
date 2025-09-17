import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Notificacion } from '../../notificacion/entities/notificacion.entity';
import { Venta } from '../../venta/entities/venta.entity'; // Importa la entidad Venta

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ nullable: false })
  nombre: string;

  @Column({ nullable: false })
  apellido: string;

  @Column({ unique: true, nullable: false })
  correo: string;

  @Column({ nullable: false })
  contraseña: string;

  @Column({ nullable: false })
  rol: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  // Relación Uno a Muchos con Notificacion
  @OneToMany(() => Notificacion, (notificacion) => notificacion.usuario)
  notificaciones: Notificacion[];

  // Nueva relación Uno a Muchos con Venta
  @OneToMany(() => Venta, (venta) => venta.usuario)
  ventas: Venta[];
}
