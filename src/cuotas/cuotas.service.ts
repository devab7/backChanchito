import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCuotaDto } from './dto/create-cuota.dto';
import { UpdateCuotaDto } from './dto/update-cuota.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cuota } from './entities/cuota.entity';
import { Raw, Repository } from 'typeorm';
import { Cliente } from 'src/clientes/entities/cliente.entity';

import { rangoDelDiaLima, fechaDateLima, formatearFechaALima, rangoDelMesLima, ahoraLima, toISOConZonaLima  } from 'src/utils/fecha.helper'; 

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


      // 🔒 NUEVO BLOQUE: valida duplicado por fecha exacta cuando agregue cuota para fechas pasadas con postman, quitar cuando ya se suba todas ls cuotas pasadas
      const fechaInput = (createCuotaDto as any).creadoEn
        ? new Date((createCuotaDto as any).creadoEn)
        : fechaDateLima(); // fallback si no viene fecha

      const existeCuotaMismaFecha = await this.cuotaRepository.findOne({
        where: {
          cliente: { id: createCuotaDto.clienteId },
          creadoEn: Raw(alias => `
            DATE_TRUNC('day', ${alias} AT TIME ZONE 'America/Lima') = DATE '${fechaInput.toISOString().slice(0, 10)}'
          `)
        }
      });

      if (existeCuotaMismaFecha) {
        throw new ConflictException({
          message: `${cliente.nombres} ya tiene una cuota registrada el ${fechaInput.toLocaleDateString('es-PE')}`,
          statusCode: 409
        });
      }
      // 🔚 FIN DEL BLOQUE NUEVO


      // Validación original: solo para el día actual (cuando ya suba todas als cuotas pasada y entonces elimino el neuvo blqoue de arriba)
      // const cuotaExistenteHoy = await this.cuotaRepository.findOne({
      //   where: {
      //     cliente: { id: createCuotaDto.clienteId },
      //     creadoEn: Raw(alias =>
      //       `${alias} BETWEEN TIMESTAMP '${inicioDelDia}' AND TIMESTAMP '${finDelDia}'`
      //     )
      //   }
      // });

      // if (cuotaExistenteHoy) {
      //   throw new ConflictException({
      //     message: `${cliente.nombres} ya registró una cuota hoy`,
      //     statusCode: 409
      //   });
      // }

      const cuota = this.cuotaRepository.create({
        cuota: createCuotaDto.cuota,
        cliente,
        tipoPago: createCuotaDto.tipoPago ?? TipoPago.EFECTIVO,
        // Descomentar estas 2 lineas para producción
        // creadoEn: fechaDateLima(),
        // actualizadoEn: fechaDateLima(),

        // 🛠️ TEMPORAL: permitir fechas personalizadas si vienen en el body, luego eliminar cuando ya estoy en producción
        creadoEn: (createCuotaDto as any).creadoEn
          ? new Date((createCuotaDto as any).creadoEn) // ya viene en formato con zona horaria lima
          : fechaDateLima(), // si viene sin zona se le pone la zona con mi helper

        actualizadoEn: (createCuotaDto as any).actualizadoEn
          ? new Date((createCuotaDto as any).actualizadoEn)
          : fechaDateLima()    
        // TEMPORAL: permitir fechas personalizadas si vienen en el body, luego eliminar cuando ya estoy en producción

      });

      const cuotaGuardada = await this.cuotaRepository.save(cuota);

      return {
        id: cuotaGuardada.id,
        cuota: cuotaGuardada.cuota,
        tipoPago: cuotaGuardada.tipoPago,
        creadoEn: toISOConZonaLima(cuotaGuardada.creadoEn),
        actualizadoEn: toISOConZonaLima(cuotaGuardada.actualizadoEn),
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






//   async obtenerResumenMensual(): Promise<{ // OK: ANALIZADO, LIBRE DE DESFASES
//   resumenMensual: {
//     mes: string;
//     total: number;
//     porTipoPago: { [tipo: string]: number };
//   }[];
//   totalAnual: number;
// }> {
//   const ahora = ahoraLima(); // ✔️ Tu helper, asegura zona 'America/Lima'
//   const añoActual = ahora.year;

//   const resumenMensual: {
//     mes: string;
//     total: number;
//     porTipoPago: Record<string, number>;
//   }[] = [];

//   let totalAnual = 0;

//   for (let mes = 1; mes <= 12; mes++) {
//     const inicioMes = DateTime.fromObject({ year: añoActual, month: mes }, { zone: 'America/Lima' }).startOf('month');
//     const finMes = inicioMes.endOf('month');

//     const cuotasDelMes = await this.cuotaRepository.find({
//       where: {
//         creadoEn: Raw(alias =>
//           `${alias} BETWEEN TIMESTAMP '${inicioMes.toISO()}' AND TIMESTAMP '${finMes.toISO()}'`
//         )
//       }
//     });

//     const totalMes = cuotasDelMes.reduce(
//       (sum, cuota) => sum + (Number(cuota.cuota) || 0),
//       0
//     );

//     totalAnual += totalMes;

//     const porTipoPago = cuotasDelMes.reduce((acc, cuota) => {
//       const tipo = cuota.tipoPago;
//       const valor = Number(cuota.cuota) || 0;
//       acc[tipo] = (acc[tipo] || 0) + valor;
//       return acc;
//     }, {} as Record<string, number>);

//     resumenMensual.push({
//       mes: inicioMes.setLocale('es').toFormat('MMMM'),
//       total: totalMes,
//       porTipoPago
//     });
//   }

//   return {
//     resumenMensual,
//     totalAnual
//   };
// }


  async obtenerResumenMensual(): Promise<{ // OK: ANALIZADO, LIBRE DE DESFASES
    resumenMensual: {
      mes: string;
      total: number;
      porTipoPago: { nombre: string; monto: number }[];
    }[];
    totalAnual: number;
    totalPorTipoPago: { nombre: string; monto: number }[]; // 🔧 AGREGADO
  }> {
    const ahora = ahoraLima(); // ✔️ Tu helper, asegura zona 'America/Lima'
    const añoActual = ahora.year;
    const mesActual = ahora.month; // 🔧 AGREGADO: limita hasta el mes Lima actual

    const resumenMensual: {
      mes: string;
      total: number;
      porTipoPago: { nombre: string; monto: number }[];
    }[] = [];

    let totalAnual = 0;

    // 🔧 AGREGADO: acumulador global por tipo
    const acumuladoGlobal: Record<string, number> = {};

    for (let mes = 1; mes <= mesActual; mes++) {
      const inicioMes = DateTime.fromObject(
        { year: añoActual, month: mes },
        { zone: 'America/Lima' }
      ).startOf('month');

      const finMes = inicioMes.endOf('month');

      const cuotasDelMes = await this.cuotaRepository.find({
        where: {
          creadoEn: Raw(alias => `
            ${alias} BETWEEN TIMESTAMP '${inicioMes.toISO()}' AND TIMESTAMP '${finMes.toISO()}'
          `)
        }
      });

      const totalMes = cuotasDelMes.reduce(
        (sum, cuota) => sum + (Number(cuota.cuota) || 0),
        0
      );

      totalAnual += totalMes;

      const agrupadoPorTipo = cuotasDelMes.reduce((acc, cuota) => {
        const tipo = cuota.tipoPago;
        const valor = Number(cuota.cuota) || 0;
        acc[tipo] = (acc[tipo] || 0) + valor;

        // 🔧 AGREGADO: sumar al acumulador global
        acumuladoGlobal[tipo] = (acumuladoGlobal[tipo] || 0) + valor;

        return acc;
      }, {} as Record<string, number>);

      const porTipoPago = Object.entries(agrupadoPorTipo).map(([nombre, monto]) => ({
        nombre,
        monto
      }));

      resumenMensual.push({
        mes: inicioMes.setLocale('es').toFormat('MMMM'),
        total: totalMes,
        porTipoPago
      });
    }

    // 🔧 AGREGADO: transformar acumulador global como array final
    const totalPorTipoPago = Object.entries(acumuladoGlobal).map(([nombre, monto]) => ({
      nombre,
      monto
    }));

    return {
      resumenMensual,
      totalAnual,
      totalPorTipoPago // 🔧 AGREGADO
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
