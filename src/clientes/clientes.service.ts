import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { DateTime } from 'luxon';

import { Cliente } from './entities/cliente.entity';
import { Cuota } from 'src/cuotas/entities/cuota.entity';
import { ahoraLima, crearFechaLima, fechaDateLima, formatearFechaALima, parseFechaCumpleDesdeFrontend, parseFechaISOALima, toISOConZonaLima } from 'src/utils/fecha.helper';
import { RetiroMesService } from 'src/retiro-mes/retiro-mes.service';

@Injectable()
export class ClientesService {

  private readonly logger = new Logger('ClientesService');

  constructor(

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Cuota)
    private readonly cuotaRepository: Repository<Cuota>,

    private readonly retiroMesService: RetiroMesService,

  ){}

  // insert a new cliente
  // async create(createClienteDto: CreateClienteDto) {
    
  //   try {

  //     const cliente = this.clienteRepository.create(createClienteDto);
  //     await this.clienteRepository.save( cliente );

  //     return cliente;
      
  //   } catch (error) {

  //     this.handleDBExceptions(error);
      
  //   }

  // }

  async create(dto: CreateClienteDto) {
    try {
      const cumpleValido =
        typeof dto.cumple === 'string' &&
        DateTime.fromFormat(dto.cumple, 'yyyy-MM-dd').isValid;

      const cliente = this.clienteRepository.create({
        ...dto,
        cumple: cumpleValido
          ? parseFechaCumpleDesdeFrontend(dto.cumple as string)
          : null,
        creadoEn: fechaDateLima(),
        actualizadoEn: fechaDateLima()
      });

      const clienteGuardado = await this.clienteRepository.save(cliente);

      return {
        id: clienteGuardado.id,
        dni: clienteGuardado.dni,
        nombres: clienteGuardado.nombres,
        direccion: clienteGuardado.direccion,
        telefono: clienteGuardado.telefono,
        telefono2: clienteGuardado.telefono2,
        cumple: clienteGuardado.cumple
          ? clienteGuardado.cumple.toISOString().slice(0, 10)
          : null,

        creadoEn: toISOConZonaLima(clienteGuardado.creadoEn),
        actualizadoEn: toISOConZonaLima(clienteGuardado.actualizadoEn)

      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // list all clientes
  findAll() {
    
    const clientes = this.clienteRepository.find({ order: { creadoEn: 'DESC' }}); 
    return clientes;

  }


  // async findOne(id: number, mes?: string): Promise<any> {
  //   const cliente = await this.clienteRepository.findOne({
  //     where: { id },
  //     relations: ['cuotas'],
  //   });

  //   if (!cliente) return null;

  //   const ahora = DateTime.now().setZone('America/Lima');
  //   const anio = ahora.year;
  //   const mesInt = mes ? Number(mes) : ahora.month;

  //   if (isNaN(mesInt) || mesInt < 1 || mesInt > 12) {
  //     throw new BadRequestException(`Mes inválido: ${mes}`);
  //   }

  //   const fechaReferencia = DateTime.fromObject({ year: anio, month: mesInt }, { zone: 'America/Lima' });
  //   const daysInMonth = fechaReferencia.daysInMonth;

  //   const cuotasDelMes = await this.cuotaRepository.find({
  //     where: {
  //       cliente: { id },
  //       creadoEn: Raw(alias => `
  //         EXTRACT(MONTH FROM ${alias} AT TIME ZONE 'America/Lima') = ${mesInt}
  //         AND EXTRACT(YEAR FROM ${alias} AT TIME ZONE 'America/Lima') = ${anio}
  //       `),
  //     },
  //     order: { creadoEn: 'DESC' },
  //   });

  //   const cuotasMap = new Map<number, number>();
  //   cuotasDelMes.forEach(cuota => {
  //     const fecha = DateTime.fromJSDate(cuota.creadoEn).setZone('America/Lima');
  //     cuotasMap.set(fecha.day, cuota.cuota);
  //   });

  //   const cuotasCompletas: Cuota[] = Array.from(
  //     Array(daysInMonth),
  //     (_, i) => {
  //       const nuevaCuota = new Cuota();
  //       nuevaCuota.creadoEn = DateTime.fromObject(
  //         { year: anio, month: mesInt, day: i + 1 },
  //         { zone: 'America/Lima' }
  //       ).startOf('day').toJSDate();

  //       nuevaCuota.cuota = cuotasMap.get(i + 1) ?? 0;

  //       return nuevaCuota;
  //     }
  //   );




  //   const totalCuotasMes = cuotasDelMes.reduce(
  //     (total, cuota) => total + (Number(cuota.cuota) || 0),
  //     0
  //   );

  //   return {
  //     id: cliente.id,
  //     dni: cliente.dni,
  //     nombres: cliente.nombres,
  //     telefono: cliente.telefono,
  //     direccion: cliente.direccion,
  //     lugarNacimiento: cliente.lugarNacimiento,
  //     telefono2: cliente.telefono2,
  //     cumple: formatearFechaALima(cliente.cumple),
  //     mes: mes?.padStart(2, '0') || ahora.month.toString().padStart(2, '0'),
  //     anio,
  //     cuotasCompletas,
  //     totalCuotasMes
  //   };
  // }



  async findOne(id: number, mes?: string): Promise<any> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['cuotas'],
    });

    if (!cliente) return null;

    const ahora = ahoraLima();
    const anio = ahora.year;
    const mesInt = mes ? Number(mes) : ahora.month;

    if (isNaN(mesInt) || mesInt < 1 || mesInt > 12) {
      throw new BadRequestException(`Mes inválido: ${mes}`);
    }

    if (mesInt > ahora.month) {
      throw new BadRequestException("Seleccione un mes anterior o igual al mes actual.");
    }

    const fechaReferencia = crearFechaLima(anio, mesInt, 1); // 👉 Helper aplicado
    const daysInMonth = fechaReferencia.daysInMonth;

    const cuotasDelMes = await this.cuotaRepository.find({
      where: {
        cliente: { id },
        creadoEn: Raw(alias => `
          EXTRACT(MONTH FROM ${alias} AT TIME ZONE 'America/Lima') = ${mesInt}
          AND EXTRACT(YEAR FROM ${alias} AT TIME ZONE 'America/Lima') = ${anio}
        `),
      },
      order: { creadoEn: 'DESC' },
    });

    const cuotasMap = new Map<number, number>();
    cuotasDelMes.forEach(cuota => {
      const fecha = DateTime.fromJSDate(cuota.creadoEn).setZone('America/Lima');
      cuotasMap.set(fecha.day, cuota.cuota);
    });

    const cuotasCompletas: Cuota[] = Array.from(
      Array(daysInMonth).fill(null),
      (_, i) => {
        const nuevaCuota = new Cuota();
        nuevaCuota.creadoEn = crearFechaLima(anio, mesInt, i + 1)
          .startOf('day')
          .toJSDate();

        nuevaCuota.cuota = cuotasMap.get(i + 1) ?? 0;

        return nuevaCuota;
      }
    );

    const totalCuotasMes = cuotasDelMes.reduce(
      (total, cuota) => total + (Number(cuota.cuota) || 0),
      0
    );

    // 🔍 Cuotas hasta el mes actual (NO hasta mes consultado)
    const cuotasHastaMesActual = await this.cuotaRepository.find({
      where: {
        cliente: { id },
        creadoEn: Raw(alias => `
          EXTRACT(MONTH FROM ${alias} AT TIME ZONE 'America/Lima') <= ${ahora.month}
          AND EXTRACT(YEAR FROM ${alias} AT TIME ZONE 'America/Lima') = ${anio}
        `),
      },
    });

    const totalAcumuladoHastaMesActual = cuotasHastaMesActual.reduce(
      (total, cuota) => total + (Number(cuota.cuota) || 0),
      0
    );

    // 🆕 Estado mensual de los retiros (acuerdo #2)
    const estadoMensual = await this.retiroMesService.obtenerEstadoMensual(id);

    // 🧮 Nuevo cálculo: saldoRealAcumulado (solo meses activos hasta el mes actual)
    const mesesActivosHastaHoy = estadoMensual
      .filter(m => m.estado === 'activo' && m.mes <= ahora.month)
      .map(m => m.mes);

    const cuotasDisponibles = cuotasHastaMesActual.filter(cuota => {
      const fecha = DateTime.fromJSDate(cuota.creadoEn).setZone('America/Lima');
      return mesesActivosHastaHoy.includes(fecha.month);
    });

    const saldoRealAcumulado = cuotasDisponibles.reduce(
      (total, cuota) => total + (Number(cuota.cuota) || 0),
      0
    );

    return {
      id: cliente.id,
      dni: cliente.dni,
      nombres: cliente.nombres,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      lugarNacimiento: cliente.lugarNacimiento,
      telefono2: cliente.telefono2,
      cumple: formatearFechaALima(cliente.cumple),
      mes: fechaReferencia.month,
      anio,
      cuotasCompletas,
      totalCuotasMes,
      totalAcumuladoHastaMesActual, // 💰 bruto hasta el mes actual
      saldoRealAcumulado,           // 🧮 neto descontando meses retirados
      estadoMensual,
    };
  }











  async update(id: number, updateClienteDto: UpdateClienteDto): Promise<any> {
    try {
      const dto = {
        ...updateClienteDto,
        cumple: updateClienteDto.cumple
          ? parseFechaCumpleDesdeFrontend(updateClienteDto.cumple)
          : undefined,
        actualizadoEn: fechaDateLima() // ✅ Timestamp manual igual que en create
      };

      const cliente = await this.clienteRepository.preload({ id, ...dto });

      if (!cliente) {
        throw new NotFoundException(`No se encontró el cliente con ID ${id}`);
      }

      const clienteActualizado = await this.clienteRepository.save(cliente);

      return {
        id: clienteActualizado.id,
        nombres: clienteActualizado.nombres,
        direccion: clienteActualizado.direccion,
        telefono: clienteActualizado.telefono,
        cumple: clienteActualizado.cumple
          ? clienteActualizado.cumple.toISOString().slice(0, 10)
          : null,
        creadoEn: formatearFechaALima(clienteActualizado.creadoEn),
        actualizadoEn: formatearFechaALima(clienteActualizado.actualizadoEn)
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }


  // delete a cliente by id
  async remove(id: number) {

    const cliente = await this.clienteRepository.delete({ id });

    if (cliente.affected === 0) {
      throw new NotFoundException(`No se encontró el registro con ID ${id}`);
    }

    return { message: 'Registro eliminado correctamente' };

  }

  


  private handleDBExceptions(error: any) {

    if (error.code === '23505') {
      const detail = error.detail || '';

      if (detail.includes('(dni)')) {
        throw new BadRequestException('Ya existe un cliente con ese DNI');
      }

      if (detail.includes('(nombres)')) {
        throw new BadRequestException('Ya existe un cliente con ese nombre');
      }

      if (detail.includes('(telefono)')) {
        throw new BadRequestException('Ya existe un cliente con ese teléfono');
      }

      if (detail.includes('(telefono2)')) {
        throw new BadRequestException('Ya existe un cliente con el teléfono 2');
      }

      // Si no identificamos el campo duplicado:
      throw new BadRequestException('Este registro ya existe');
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Ocurrió un error inesperado. Revisá los logs del servidor.');
  }


}
