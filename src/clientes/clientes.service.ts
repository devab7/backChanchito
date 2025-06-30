import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { DateTime } from 'luxon';

import { Cliente } from './entities/cliente.entity';
import { Cuota } from 'src/cuotas/entities/cuota.entity';
import { ahoraLima, fechaDateLima, formatearFechaALima, parseFechaCumpleDesdeFrontend, parseFechaISOALima } from 'src/utils/fecha.helper';

@Injectable()
export class ClientesService {

  private readonly logger = new Logger('ClientesService');

  constructor(

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Cuota)
    private readonly cuotaRepository: Repository<Cuota>,

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
        nombres: clienteGuardado.nombres,
        direccion: clienteGuardado.direccion,
        telefono: clienteGuardado.telefono,
        cumple: clienteGuardado.cumple
          ? clienteGuardado.cumple.toISOString().slice(0, 10)
          : null,
        creadoEn: formatearFechaALima(clienteGuardado.creadoEn),
        actualizadoEn: formatearFechaALima(clienteGuardado.actualizadoEn)
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

// async findAll() {
//   const clientes = await this.clienteRepository.find({
//     order: {
//       creadoEn: 'DESC',
//       // id: 'DESC' // ⚠️ esto le da orden estable incluso si el día es el mismo
//     } 
//   });

//   return clientes.map(cliente => ({
//     id: cliente.id,
//     dni: cliente.dni,
//     nombres: cliente.nombres,
//     telefono: cliente.telefono,
//     telefono2: cliente.telefono2,
//     direccion: cliente.direccion,
//     lugarNacimiento: cliente.lugarNacimiento,
//     cumple: cliente.cumple, // podés formatearla si lo necesita la vista
//     creadoEn: formatearFechaALima(cliente.creadoEn),
//     actualizadoEn: formatearFechaALima(cliente.actualizadoEn)
//   }));
// }









  // async findOne(id: number): Promise<any> {

  //   const cliente = await this.clienteRepository.findOne({
  //     where: { id },
  //     relations: ['cuotas'],
  //   });

  //   if (!cliente) return null;

  //   // Obtenemos la fecha actual en zona horaria de Lima y determinamos el año, mes y cantidad de días.
  //   // En caso de que no se pueda calcular correctamente la cantidad de días del mes, lanzamos una excepción controlada.
  //   const ahora = ahoraLima();
  //   // const ahora = DateTime.fromObject({ year: 2025, month: 2 }, { zone: 'America/Lima' }); // para simular el mes de febrero
  //   const year = ahora.year;
  //   const month = ahora.month;
  //   const daysInMonth = Number(ahora.daysInMonth);
  //   if (!daysInMonth || isNaN(daysInMonth)) {
  //     throw new BadRequestException(
  //       `No se pudo determinar los días del mes para la fecha: ${ahora.toISO()}`
  //     );
  //   }

  //   // Trae las cuotas del mes del clliente
  //   const cuotasDelMes = await this.cuotaRepository.find({
  //     where: {
  //       cliente: { id },
  //       creadoEn: Raw(alias => `
  //         EXTRACT(MONTH FROM ${alias} AT TIME ZONE 'America/Lima') = ${month}
  //         AND EXTRACT(YEAR FROM ${alias} AT TIME ZONE 'America/Lima') = ${year}
  //       `),
  //     },
  //     order: { creadoEn: 'DESC' },
  //   });


  //   const cuotasMap = new Map<number, number>();
  //   cuotasDelMes.forEach(cuota => {
  //     const fecha = DateTime.fromJSDate(cuota.creadoEn).setZone('America/Lima');
  //     cuotasMap.set(fecha.day, cuota.cuota);
  //   });

  //   // Rellena los días del mes con las cuotas correspondientes. sino hay cuota para ese día, se asigna 0.
  //   const cuotasCompletas: Cuota[] = Array.from({ length: daysInMonth }, (_, i) => {
  //     const nuevaCuota = new Cuota();
  //     nuevaCuota.creadoEn = DateTime.fromObject(
  //       { year, month, day: i + 1 },
  //       { zone: 'America/Lima' }
  //     ).startOf('day').toJSDate();

  //     nuevaCuota.cuota = cuotasMap.get(i + 1) ?? 0;
  //     // nuevaCuota.cliente = cliente;
  //     return nuevaCuota;
  //   });

  //   // Suma el total de cuotas del mes
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

  const ahora = DateTime.now().setZone('America/Lima');
  const anio = ahora.year;
  const mesInt = mes ? Number(mes) : ahora.month;

  if (isNaN(mesInt) || mesInt < 1 || mesInt > 12) {
    throw new BadRequestException(`Mes inválido: ${mes}`);
  }

  const fechaReferencia = DateTime.fromObject({ year: anio, month: mesInt }, { zone: 'America/Lima' });
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
    Array(daysInMonth),
    (_, i) => {
      const nuevaCuota = new Cuota();
      nuevaCuota.creadoEn = DateTime.fromObject(
        { year: anio, month: mesInt, day: i + 1 },
        { zone: 'America/Lima' }
      ).startOf('day').toJSDate();

      nuevaCuota.cuota = cuotasMap.get(i + 1) ?? 0;

      return nuevaCuota;
    }
  );




  const totalCuotasMes = cuotasDelMes.reduce(
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
    mes: mes?.padStart(2, '0') || ahora.month.toString().padStart(2, '0'),
    anio,
    cuotasCompletas,
    totalCuotasMes
  };
}






  // update a cliente by id
  // async update(id: number, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
  //   const cliente = await this.clienteRepository.preload({
  //     id,
  //     ...updateClienteDto,
  //   });

  //   if (!cliente) {
  //     throw new NotFoundException(`No se encontró el cliente con ID ${id}`);
  //   }

  //   return this.clienteRepository.save(cliente);
  // }

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

  

  // private handleDBExceptions( error: any ) {

  //   if ( error.code === '23505' )
  //     throw new BadRequestException(error.detail);
    
  //   this.logger.error(error)
  //   // console.log(error)
  //   throw new InternalServerErrorException('Unexpected error, check server logs');

  // }

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
