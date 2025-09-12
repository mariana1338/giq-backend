// src/modules/instrumento-quirurgico/entities/instrumento-quirurgico.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CategoriaInstrumento } from '../../categoria-instrumento/entities/categoria-instrumento.entity';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';
import { UbicacionAlmacen } from '../../ubicacion-almacen/entities/ubicacion-almacen.entity';

@Entity('instrumentos_quirurgicos')
export class InstrumentoQuirurgico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 150 })
  nombre: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  precioUnitario: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  precioVenta: number;

  @Column('int', { default: 0 })
  cantidadStock: number;

  @Column('int', { default: 0 })
  cantidadStockMinima: number;

  @Column({ type: 'date', nullable: true })
  fechaAdquisicion: Date;

  @ManyToOne(
    () => CategoriaInstrumento,
    (categoria) => categoria.instrumentos,
    { eager: true, onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'categoriaId' })
  categoria: CategoriaInstrumento | null;

  @Column({ nullable: true })
  categoriaId: number | null; // También es buena práctica indicar que el ID puede ser null

  // Relación Many-to-One con Proveedor
  // Un instrumento es suministrado por un proveedor.
  @ManyToOne(
    () => Proveedor,

    (proveedor: Proveedor) => proveedor.instrumentos, // ¡CORRECCIÓN AQUÍ! Tipado explícito de 'proveedor'
    {
      eager: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Proveedor | null;

  @Column({ nullable: true })
  proveedorId: number | null; // También es buena práctica indicar que el ID puede ser null

  // Relación Many-to-One con UbicacionAlmacen
  // Un instrumento se encuentra en una ubicación de almacén.
  @ManyToOne(
    () => UbicacionAlmacen,

    (ubicacion: UbicacionAlmacen) => ubicacion.instrumentos, // ¡CORRECCIÓN AQUÍ! Tipado explícito de 'ubicacion'
    {
      eager: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'ubicacionId' })
  ubicacion: UbicacionAlmacen | null;

  @Column({ nullable: true })
  ubicacionId: number | null; // También es buena práctica indicar que el ID puede ser null
}
