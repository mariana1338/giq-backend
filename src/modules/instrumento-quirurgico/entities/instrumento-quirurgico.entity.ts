// src/modules/instrumento-quirurgico/entities/instrumento-quirurgico.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CategoriaInstrumento } from '../../categoria-instrumento/entities/categoria-instrumento.entity';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';
import { UbicacionAlmacen } from '../../ubicacion-almacen/entities/ubicacion-almacen.entity';
import { MovimientoInventario } from '../../movimiento/entities/movimiento.entity';
import { Notificacion } from '../../notificacion/entities/notificacion.entity';

@Entity('instrumentos_quirurgicos')
export class InstrumentoQuirurgico {
  @PrimaryGeneratedColumn()
  id_instrumento: number;

  @Column()
  nombre: string;

  @Column()
  codigo: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column('int')
  precioUnitario: number;

  @Column('int')
  precioVenta: number;

  @Column('int')
  cantidadStock: number;

  @Column('int')
  cantidadStockMinima: number;

  @Column({ type: 'date', nullable: true })
  fechaAdquisicion: Date;

  // Relaciones
  @ManyToOne(() => CategoriaInstrumento, (categoria) => categoria.instrumentos)
  @JoinColumn({ name: 'categoria_id' }) // <-- Corregido para que coincida con tu base de datos
  categoria: CategoriaInstrumento;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.instrumentos)
  @JoinColumn({ name: 'proveedor_id' }) // <-- Corregido para que coincida con tu base de datos
  proveedor: Proveedor;

  @ManyToOne(() => UbicacionAlmacen, (ubicacion) => ubicacion.instrumentos)
  @JoinColumn({ name: 'ubicacion_id' }) // <-- Corregido para que coincida con tu base de datos
  ubicacion: UbicacionAlmacen;

  @OneToMany(() => MovimientoInventario, (movimiento) => movimiento.instrumento)
  movimientos: MovimientoInventario[];

  @OneToMany(() => Notificacion, (notificacion) => notificacion.instrumento)
  notificaciones: Notificacion[];
}
