// src/modules/movimiento/movimiento.service.ts

import { 
    Injectable, 
    BadRequestException, 
    NotFoundException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoInventario } from './entities/movimiento.entity';
import { InstrumentoQuirurgico } from '../instrumento-quirurgico/entities/instrumento-quirurgico.entity';
import { Usuario } from '../usuario/entities/usuario.entity'; 
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Injectable()
export class MovimientoService {
    constructor(
        @InjectRepository(MovimientoInventario)
        private movimientoRepository: Repository<MovimientoInventario>,
        
        @InjectRepository(InstrumentoQuirurgico)
        private instrumentoRepository: Repository<InstrumentoQuirurgico>,
        
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
    ) {}

    // ------------------------------------------------------------------
    // A. CREACIÓN DE MOVIMIENTO (INCLUYE LÓGICA DE STOCK)
    // ------------------------------------------------------------------
    async create(createMovimientoDto: CreateMovimientoDto): Promise<MovimientoInventario> {
        const { instrumentoId, cantidad, tipo_movimiento, precio, usuarioId } = createMovimientoDto;
        
        const instrumento = await this.instrumentoRepository.findOne({
            where: { id_instrumento: instrumentoId },
        });

        if (!instrumento) {
            throw new NotFoundException(`Instrumento con ID ${instrumentoId} no encontrado.`);
        }

        const usuario = await this.usuarioRepository.findOneBy({
            id_usuario: usuarioId,
        });

        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado.`);
        }


        // 3. Determinar el cambio de stock
        let nuevoStock = instrumento.cantidadStock;
        const tipoLimpio = tipo_movimiento.toLowerCase().trim();
        const esSalida = tipoLimpio === 'salida';
        const esEntrada = tipoLimpio === 'entrada';

        // 🔑 Bandera para saber si debemos modificar el stock del instrumento
        let debeActualizarStock = true; 
        
        // 🔑 VERIFICACIÓN CRÍTICA: Omitir la actualización de stock para 'entrada' si viene del InstrumentoService.
        // Asumimos que si la cantidadStock del instrumento es igual a 0, este movimiento de 'entrada' es una reposición,
        // pero si viene desde el InstrumentoService, generalmente el stock ya se ha fijado en la entidad.
        // Si este servicio SOLO debe usarse para VENTAS y REPOSICIONES manuales, la lógica de 'entrada' debe actualizar stock.
        
        if (esSalida) {
            // 3a. VALIDACIÓN CRÍTICA: Suficiencia de Stock para 'salida' (Venta)
            if (instrumento.cantidadStock < cantidad) {
                throw new BadRequestException(
                    `Stock insuficiente. Solo quedan ${instrumento.cantidadStock} unidades de ${instrumento.nombre}.`
                );
            }
            nuevoStock -= cantidad;
        } else if (esEntrada) {
            // 3b. Lógica de 'entrada' (Reposición manual o inicial)
            // Si el movimiento es de entrada, SUMAMOS la cantidad al stock.
            nuevoStock += cantidad;
        } else {
            throw new BadRequestException('Tipo de movimiento no válido. Debe ser "entrada" o "salida".');
        }


        // 4. Crear la nueva entidad Movimiento
        const nuevoMovimiento = this.movimientoRepository.create({
            cantidad,
            tipo_movimiento: tipoLimpio,
            precio,
            instrumento: instrumento,
            usuario: usuario,
        });

        // 5. GUARDAR TRANSACCIÓN (Movimiento) y ACTUALIZAR (Instrumento)
        try {
            // 🔑 Actualizamos el stock SOLO si es necesario (generalmente sí, excepto en flujos especiales)
            instrumento.cantidadStock = nuevoStock;
            await this.instrumentoRepository.save(instrumento);

            // Guardar y retornar el movimiento
            return await this.movimientoRepository.save(nuevoMovimiento);
        } catch (error) {
             console.error("Error al guardar movimiento o actualizar stock:", error);
             throw new HttpException(
                 'Fallo al realizar la transacción de inventario en la base de datos.',
                 HttpStatus.INTERNAL_SERVER_ERROR,
             );
        }
    }

    // ------------------------------------------------------------------
    // B. OBTENER MOVIMIENTOS (LECTURA)
    // ------------------------------------------------------------------
    async findAll(
    nombreFiltro?: string,
    fechaDesde?: string, 
    fechaHasta?: string, // <--- Este es el parámetro que ajustaremos
    tipoMovimiento?: string,
): Promise<MovimientoInventario[]> {
    const queryBuilder = this.movimientoRepository.createQueryBuilder('movimiento');
    
    queryBuilder.leftJoinAndSelect('movimiento.instrumento', 'instrumento');
    queryBuilder.leftJoinAndSelect('movimiento.usuario', 'usuario');

    // 1. FILTRO POR TIPO DE MOVIMIENTO
    if (tipoMovimiento && tipoMovimiento.toLowerCase().trim() !== 'todos') {
        queryBuilder.where('LOWER(movimiento.tipo_movimiento) = :tipo', { 
            tipo: tipoMovimiento.toLowerCase().trim() 
        });
    }

    // 2. FILTRO POR PRODUCTO (nombreFiltro)
    if (nombreFiltro) {
        queryBuilder.andWhere('instrumento.nombre LIKE :nombre', { nombre: `%${nombreFiltro}%` });
    }

    // 3. FILTRO POR FECHA DESDE (Inicio del día)
    if (fechaDesde) {
        // La fecha de inicio del día está bien (2025-10-02 00:00:00)
        queryBuilder.andWhere('movimiento.fecha >= :fechaDesde', { fechaDesde: new Date(fechaDesde) });
    }

    // 4. 🔑 FILTRO POR FECHA HASTA (Ajuste para incluir el día completo)
    if (fechaHasta) {
        // Creamos un objeto Date con la fecha final.
        const finalDelDia = new Date(fechaHasta);
        
        // CRUCIAL: Establecer la hora a las 23:59:59.999 para cubrir todo el día.
        // NOTA: Para algunas bases de datos como PostgreSQL, es más seguro sumar un día y usar '<'.
        // Pero para MySQL y TypeORM, establecer la hora final suele ser suficiente.
        finalDelDia.setHours(23, 59, 59, 999); 
        
        // Aplicamos la condición 'menor o igual' al final del día.
        queryBuilder.andWhere('movimiento.fecha <= :fechaHasta', { fechaHasta: finalDelDia });
    }
    
    queryBuilder.orderBy('movimiento.fecha', 'DESC');
    
    return queryBuilder.getMany();
    }
}