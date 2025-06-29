import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCuotaDto } from './dto/create-cuota.dto';
import { UpdateCuotaDto } from './dto/update-cuota.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cuota } from './entities/cuota.entity';
import { Raw, Repository } from 'typeorm';
import { Cliente } from 'src/clientes/entities/cliente.entity';

import { rangoDelDiaLima, fechaDateLima, formatearFechaALima, rangoDelMesLima  } from 'src/utils/fecha.helper'; 

import { DateTime } from 'luxon';
import { TipoPago } from 'src/enums/tipo-pago.enum';


@Injectable()
export class CuotasService {

    private readonly logger = new Logger('CuotasService');
  
    constructor(
  
      @InjectRepository(Cuota)
      private readonly cuotaRepository: Repository<Cuota>,

      @InjectRepository(Cliente)
      private readonly clienteRepository: Repository<Cliente>
  
    ){}

  // insert a new cuota
  async create(createCuotaDto: CreateCuotaDto) {

    try {
      const { desde: inicioDelDia, hasta: finDelDia } = rangoDelDiaLima();

      const cliente = await this.clienteRepository.findOneBy({
        id: createCuotaDto.clienteId
      });

      if (!cliente) throw new NotFoundException('Cliente no encontrado');

      const cuotaExistenteHoy = await this.cuotaRepository.findOne({
        where: {
          cliente: { id: createCuotaDto.clienteId },
          creadoEn: Raw(alias =>
            `${alias} BETWEEN TIMESTAMP '${inicioDelDia}' AND TIMESTAMP '${finDelDia}'`
          )
        }
      });

      if (cuotaExistenteHoy) {
        throw new ConflictException({
          message: `${cliente.nombres} ya registró una cuota hoy`,
          statusCode: 409
        });
      }

      const cuota = this.cuotaRepository.create({
        cuota: createCuotaDto.cuota,
        cliente,
        tipoPago: createCuotaDto.tipoPago ?? TipoPago.EFECTIVO,
        creadoEn: fechaDateLima(),
        actualizadoEn: fechaDateLima()
      });

      const cuotaGuardada = await this.cuotaRepository.save(cuota);

      return {
        id: cuotaGuardada.id,
        cuota: cuotaGuardada.cuota,
        tipoPago: cuotaGuardada.tipoPago,
        creadoEn: formatearFechaALima(cuotaGuardada.creadoEn),
        actualizadoEn: formatearFechaALima(cuotaGuardada.actualizadoEn),
        cliente: {
          id: cliente.id,
          nombres: cliente.nombres
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // async create(createCuotaDto: CreateCuotaDto) {
  //   try {
  //     const cliente = await this.clienteRepository.findOneBy({ id: createCuotaDto.clienteId });
  //     if (!cliente) throw new NotFoundException('Cliente no encontrado');

  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0); // 📌 Normaliza la fecha para comparar sin horas

  //     // Verificar si ya existe una cuota en el día actual
  //     const cuotaExistente = await this.cuotaRepository.findOne({
  //       where: {
  //         cliente: { id: createCuotaDto.clienteId },
  //         creadoEn: Raw(alias => `DATE(${alias}) = DATE(:today)`, { today })
  //       }
  //     });

  //     if (cuotaExistente) {
  //       throw new ConflictException({
  //         message: `${cliente.nombres} ya registró una cuota hoy`,          
  //         statusCode: 409
  //       });
  //     }

  //     // 🚀 **Crear nueva cuota**
  //     const cuota = this.cuotaRepository.create({
  //       importe: createCuotaDto.importe,
  //       cliente
  //     });

  //     return await this.cuotaRepository.save(cuota);
  //   } catch (error) {
  //     throw error; // 📌 Se lanza el error para que el controlador lo maneje
  //   }
  // }

  findAll() {
    const cuotas = this.cuotaRepository.find({ order: { creadoEn: 'DESC' }}); 
    return cuotas;
  }

  // Obtener cuotas del día
  // async findAllCuotasDelDia() {
  //   const zona = 'America/Lima';
  //   const hoy = DateTime.now().setZone(zona);

  //   const startOfDay = hoy.startOf('day').toISO(); // '2025-06-20T00:00:00.000-05:00'
  //   const endOfDay = hoy.endOf('day').toISO();     // '2025-06-20T23:59:59.999-05:00'

  //   const cuotasDelDia = await this.cuotaRepository.find({
  //     where: {
  //       creadoEn: Raw(alias =>
  //         `${alias} BETWEEN TIMESTAMP '${startOfDay}' AND TIMESTAMP '${endOfDay}'`
  //       )
  //     },
  //     relations: ['cliente'],
  //     order: { creadoEn: 'ASC' }
  //   });

  //   const totalDelDia = cuotasDelDia.reduce(
  //     (sum, cuota) => sum + (Number(cuota.cuota) || 0),
  //     0
  //   ).toFixed(2);

  //   return {
  //     fecha: hoy.toISODate(),
  //     totalCuotasDelDia: totalDelDia,
  //     cuotas: cuotasDelDia
  //   };
  // }

  // async findAllCuotasDelDia() {

  //   const { desde: inicioDelDia, hasta: finDelDia } = rangoDelDiaLima();
  //   const hoy = DateTime.now().setZone('America/Lima');

  //   const cuotasDelDia = await this.cuotaRepository.find({
  //     where: {
  //       creadoEn: Raw(alias =>
  //         `${alias} BETWEEN TIMESTAMP '${inicioDelDia}' AND TIMESTAMP '${finDelDia}'`
  //       )
  //     },
  //     relations: ['cliente'],
  //     order: { creadoEn: 'ASC' }
  //   });

  //   const totalDelDia = cuotasDelDia.reduce(
  //     (sum, cuota) => sum + (Number(cuota.cuota) || 0),
  //     0
  //   ).toFixed(2);

  //   return {
  //     totalCuotasDelDia: totalDelDia,
  //     cuotas: cuotasDelDia.map(cuota => ({
  //       id: cuota.id,
  //       cuota: cuota.cuota,
  //       tipoPago: cuota.tipoPago,
  //       creadoEn: formatearFechaALima(cuota.creadoEn),
  //       actualizadoEn: formatearFechaALima(cuota.actualizadoEn),
  //       cliente: {
  //         id: cuota.cliente.id,
  //         nombres: cuota.cliente.nombres
  //       }
  //     }))
  //   };
  // }


async findAllCuotasDelDia() {
  const { desde: inicioDelDia, hasta: finDelDia } = rangoDelDiaLima();
  const hoy = DateTime.now().setZone('America/Lima');

  const cuotasDelDia = await this.cuotaRepository.find({
    where: {
      creadoEn: Raw(alias =>
        `${alias} BETWEEN TIMESTAMP '${inicioDelDia}' AND TIMESTAMP '${finDelDia}'`
      )
    },
    relations: ['cliente'],
    order: { creadoEn: 'ASC' }
  });

  const totalDelDia = parseFloat(
    cuotasDelDia.reduce(
      (sum, cuota) => sum + (Number(cuota.cuota) || 0),
      0
    ).toFixed(2)
  );



  const totalPorTipoPago = cuotasDelDia.reduce((acc, cuota) => {
    const tipo = cuota.tipoPago;
    const valor = Number(cuota.cuota) || 0;
    acc[tipo] = (acc[tipo] || 0) + valor;
    return acc;
  }, {} as Record<string, number>);

  const totalPorTipoPagoFormateado = totalPorTipoPago;


  return {
    totalCuotasDelDia: totalDelDia,
    totalPorTipoPago: totalPorTipoPagoFormateado,
    cuotas: cuotasDelDia.map(cuota => ({
      id: cuota.id,
      cuota: cuota.cuota,
      tipoPago: cuota.tipoPago,
      creadoEn: formatearFechaALima(cuota.creadoEn),
      actualizadoEn: formatearFechaALima(cuota.actualizadoEn),
      cliente: {
        id: cuota.cliente.id,
        nombres: cuota.cliente.nombres
      }
    }))
  };
}







// Obtener la cuota base del mes para un cliente específico

  // async obtenerCuotaBaseDelMes(clienteId: number) {
  //   const { desde: inicioMes, hasta: finMes } = rangoDelMesLima(); // 

  //   const cuotaBase = await this.cuotaRepository.findOne({
  //     where: {
  //       cliente: { id: clienteId },
  //       creadoEn: Raw(alias =>
  //         `${alias} BETWEEN TIMESTAMP '${inicioMes}' AND TIMESTAMP '${finMes}'`
  //       )
  //     },
  //     order: { creadoEn: 'ASC' },
  //     relations: ['cliente'] 
  //   });

  //   if (!cuotaBase) return null;

  //   return {
  //     id: cuotaBase.id,
  //     cuotaBase: cuotaBase.cuota, 
  //     creadoEn: formatearFechaALima(cuotaBase.creadoEn), 
  //     clienteId,
  //     clienteNombres: cuotaBase.cliente.nombres
  //   }
    
  // }

  async obtenerCuotaBaseDelMes(clienteId: number, mes?: string) {
    const zona = 'America/Lima';
    const ahora = DateTime.now().setZone(zona);

    let inicioMes: string;
    let finMes: string;

    if (mes) {
      // Si se especifica el mes (ej: '06'), calculamos el rango manualmente
      const referencia = DateTime.fromObject(
        { year: ahora.year, month: Number(mes) },
        { zone: zona }
      );

      inicioMes = referencia.startOf('month').toISO() ?? '';
      finMes = referencia.endOf('month').toISO() ?? '';
    } else {
      // Si no se envía nada, usamos tu helper original
      const rango = rangoDelMesLima();
      inicioMes = rango.desde;
      finMes = rango.hasta;
    }

    const cuotaBase = await this.cuotaRepository.findOne({
      where: {
        cliente: { id: clienteId },
        creadoEn: Raw(alias =>
          `${alias} BETWEEN TIMESTAMP '${inicioMes}' AND TIMESTAMP '${finMes}'`
        )
      },
      order: { creadoEn: 'ASC' },
      relations: ['cliente']
    });

    if (!cuotaBase) return null;

    return {
      id: cuotaBase.id,
      cuotaBase: cuotaBase.cuota,
      creadoEn: formatearFechaALima(cuotaBase.creadoEn),
      clienteId,
      clienteNombres: cuotaBase.cliente.nombres
    };
  }












  findOne(id: number) {
    return `This action returns a #${id} cuota`;
  }

  update(id: number, updateCuotaDto: UpdateCuotaDto) {
    return `This action updates a #${id} cuota`;
  }

  remove(id: number) {
    return `This action removes a #${id} cuota`;
  }


  private handleDBExceptions( error: any ) {

    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }
}
