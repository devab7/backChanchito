import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RetirarMesDto } from './dto/retirar-mes.dto';
import { ahoraLima, fechaDateLima, toISOConZonaLima } from 'src/utils/fecha.helper';
import { DateTime } from 'luxon';
import { RetiroMes } from './entities/retiro-mes.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RetiroMesService {

  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(RetiroMes)
    private readonly retiroRepository: Repository<RetiroMes>,
  ) {}


  // async retirarMes(dto: RetirarMesDto): Promise<RetiroMes> {
  //   const { clienteId, mes } = dto;
  //   const ahora = ahoraLima();
  //   const anio = ahora.year;

  //   // 🛡️ Paso 1: Validar existencia del cliente
  //   const cliente = await this.clienteRepository.findOne({ where: { id: clienteId } });
  //   if (!cliente) {
  //     throw new NotFoundException(`Cliente con ID ${clienteId} no existe`);
  //   }

  //   // 📅 Paso 2: Validar que el mes esté en el rango 1–12
  //   if (mes < 1 || mes > 12) {
  //     throw new BadRequestException(`Mes inválido: ${mes}`);
  //   }

  //   // ⏳ Paso 3: Validar que el mes no sea posterior al actual
  //   if (mes > ahora.month) {
  //     const mesNombre = DateTime.fromObject({ month: mes }, { zone: 'America/Lima' }).setLocale('es').toFormat('MMMM');
  //     const actualNombre = ahora.setLocale('es').toFormat('MMMM');
  //     throw new BadRequestException(`No se puede retirar "${mesNombre}" porque estamos en "${actualNombre}"`);
  //   }

  //   // 📦 Paso 4: Obtener meses retirados por el cliente en el año actual
  //   const mesesRetirados = await this.retiroRepository.find({
  //     where: {
  //       cliente: { id: clienteId },
  //       anio
  //     },
  //     order: { mes: 'ASC' }
  //   });

  //   const mesesYaRetirados = mesesRetirados.map(r => r.mes);

  //   // 🛑 Validación extra: si el mes ya fue retirado, lanzar excepción directa
  //   if (mesesYaRetirados.includes(mes)) {
  //     const mesNombre = DateTime.fromObject({ month: mes }, { zone: 'America/Lima' }).setLocale('es').toFormat('MMMM');
  //     throw new BadRequestException(`Ya retiraste el mes "${mesNombre}"`);
  //   }

  //   // 🧠 Paso 5: Calcular el próximo mes elegible (orden cronológico)
  //   const mesEsperado = (mesesYaRetirados.length === 0)
  //     ? 1 // Primer retiro debe ser enero
  //     : mesesYaRetirados[mesesYaRetirados.length - 1] + 1;

  //   if (mes !== mesEsperado) {
  //     const esperadoNombre = DateTime.fromObject({ month: mesEsperado }, { zone: 'America/Lima' }).setLocale('es').toFormat('MMMM');
  //     const recibidoNombre = DateTime.fromObject({ month: mes }, { zone: 'America/Lima' }).setLocale('es').toFormat('MMMM');
  //     throw new BadRequestException(`No se puede retirar "${recibidoNombre}". El próximo mes disponible es "${esperadoNombre}"`);
  //   }

  //   // 📥 Paso 6: Registrar el retiro
  //   const retiro = new RetiroMes();
  //   retiro.cliente = cliente;
  //   retiro.mes = mes;
  //   retiro.anio = anio;
  //   retiro.creadoEn = ahora.toJSDate();
  //   retiro.actualizadoEn = ahora.toJSDate();

  //   return await this.retiroRepository.save(retiro);
  // }

  
  async retirarMes(dto: RetirarMesDto): Promise<any> {
    const { clienteId, mes } = dto;
    const ahora = ahoraLima();
    const anio = ahora.year;

    const cliente = await this.clienteRepository.findOne({ where: { id: clienteId } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no existe`);
    }

    if (mes < 1 || mes > 12) {
      throw new BadRequestException(`Mes inválido: ${mes}`);
    }

    if (mes > ahora.month) {
      const mesNombre = DateTime.fromObject({ month: mes }, { zone: 'America/Lima' }).setLocale('es').toFormat('MMMM');
      const actualNombre = ahora.setLocale('es').toFormat('MMMM');
      throw new BadRequestException(`No se puede retirar "${mesNombre}" porque estamos en "${actualNombre}"`);
    }

    const mesesRetirados = await this.retiroRepository.find({
      where: { cliente: { id: clienteId }, anio },
      order: { mes: 'ASC' }
    });

    const mesesYaRetirados = mesesRetirados.map(r => r.mes);

    if (mesesYaRetirados.includes(mes)) {
      const mesNombre = DateTime.fromObject({ month: mes }, { zone: 'America/Lima' }).setLocale('es').toFormat('MMMM');
      throw new BadRequestException(`Ya retiraste el mes "${mesNombre}"`);
    }

    const mesEsperado = (mesesYaRetirados.length === 0)
      ? 1
      : mesesYaRetirados[mesesYaRetirados.length - 1] + 1;

    if (mes !== mesEsperado) {
      const esperadoNombre = DateTime.fromObject({ month: mesEsperado }, { zone: 'America/Lima' }).setLocale('es').toFormat('MMMM');
      const recibidoNombre = DateTime.fromObject({ month: mes }, { zone: 'America/Lima' }).setLocale('es').toFormat('MMMM');
      throw new BadRequestException(`No se puede retirar "${recibidoNombre}". El próximo mes disponible es "${esperadoNombre}"`);
    }

    // 📥 Guardar el retiro — sigue guardando como Date en base de datos
    const retiro = new RetiroMes();
    retiro.cliente = cliente;
    retiro.mes = mes;
    retiro.anio = anio;
    retiro.creadoEn = fechaDateLima();       // ✅ helper con hora Lima
    retiro.actualizadoEn = fechaDateLima();  // ✅ helper con hora Lima


    await this.retiroRepository.save(retiro);

    // ✅ Corrección #1: comillas en nombre de columna para evitar error SQL
    const cuotasDelMes = await this.clienteRepository.manager.query(`
      SELECT cuota FROM cuota
      WHERE "clienteId" = $1
        AND EXTRACT(MONTH FROM "creadoEn" AT TIME ZONE 'America/Lima') = $2
        AND EXTRACT(YEAR FROM "creadoEn" AT TIME ZONE 'America/Lima') = $3
    `, [clienteId, mes, anio]);

    const totalRetiradoDelMes = cuotasDelMes.reduce(
      (total, c) => total + (Number(c.cuota) || 0),
      0
    );

    // ✅ Corrección #2: fechas convertidas a ISO con zona Lima en el response final
    return {
      id: retiro.id,
      mes: retiro.mes,
      anio: retiro.anio,
      cliente,
      // creadoEn: ahora.toISO(),       
      // actualizadoEn: ahora.toISO(),  
      creadoEn: toISOConZonaLima(retiro.creadoEn),
      actualizadoEn: toISOConZonaLima(retiro.actualizadoEn),
      totalRetiradoDelMes,
      mesActual: ahora.month, 
      nombreMesActual: ahora.setLocale('es').toFormat('MMMM'),
    };
  }





  // async obtenerEstadoMensual(clienteId: number): Promise<{ mes: number; nombre: string; estado: 'activo' | 'retirado' }[]> {

  //   const ahora = ahoraLima(); // 📍 Asegura zona horaria 'America/Lima'
  //   const anio = ahora.year;

  //   // 🧾 Consulta todos los retiros del cliente en el año actual
  //   const retiros = await this.retiroRepository.find({
  //     where: { cliente: { id: clienteId }, anio },
  //   });

  //   const mesesRetirados = retiros.map(r => r.mes);

  //   // 🔁 Recorre desde enero hasta el mes actual
  //   const lista: { mes: number; nombre: string; estado: 'activo' | 'retirado' }[] = [];

  //   for (let m = 1; m <= ahora.month; m++) {
  //     const nombreMes = DateTime.fromObject({ month: m }, { zone: 'America/Lima' })
  //       .setLocale('es')
  //       .toFormat('MMMM'); // 📆 Nombre en español

  //     lista.push({
  //       mes: m,
  //       nombre: nombreMes,
  //       estado: mesesRetirados.includes(m) ? 'retirado' : 'activo'
  //     });
  //   }

  //   return lista;
  // }


//   async obtenerEstadoMensual(
//     clienteId: number
//   ): Promise<
//   {
//     mes: number;
//     nombre: string;
//     estado: 'activo' | 'retirado';
//     creadoEn?: string;
//     totalRetirado?: number;
//   }[]
// > {
//   const ahora = ahoraLima(); // ✅ ⏰ Hora Lima blindada
//   const anio = ahora.year;

//   // 📥 Trae todos los retiros del cliente en este año
//   const retiros = await this.retiroRepository.find({
//     where: { cliente: { id: clienteId }, anio },
//   });

//   const lista: {
//     mes: number;
//     nombre: string;
//     estado: 'activo' | 'retirado';
//     creadoEn?: string;
//     totalRetirado?: number;
//   }[] = [];

//   for (let m = 1; m <= ahora.month; m++) {
//     // 📆 Nombre del mes en español desde Luxon zona Lima
//     const nombreMes = DateTime.fromObject({ month: m }, { zone: 'America/Lima' })
//       .setLocale('es')
//       .toFormat('MMMM');

//     // 🔍 Busca si existe retiro para ese mes
//     const retiro = retiros.find(r => r.mes === m);

//     let creadoEn: string | undefined;
//     let totalRetirado: number | undefined;

//     if (retiro) {
//       creadoEn = toISOConZonaLima(retiro.creadoEn); // ✅ Fecha sin desfase

//       // 💰 Consulta cuotas retiradas del mes en zona Lima
//       const cuotasDelMes = await this.retiroRepository.manager.query(
//         `
//         SELECT cuota FROM cuota
//         WHERE "clienteId" = $1
//           AND EXTRACT(MONTH FROM "creadoEn" AT TIME ZONE 'America/Lima') = $2
//           AND EXTRACT(YEAR FROM "creadoEn" AT TIME ZONE 'America/Lima') = $3
//         `,
//         [clienteId, m, anio]
//       );

//       totalRetirado = cuotasDelMes.reduce(
//         (total, c) => total + (Number(c.cuota) || 0),
//         0
//       );
//     }

//     // 🧩 Construye el objeto mensual
//     lista.push({
//       mes: m,
//       nombre: nombreMes,
//       estado: retiro ? 'retirado' : 'activo',
//       creadoEn,
//       totalRetirado,
//     });
//   }

//   return lista;
//   }


  async obtenerEstadoMensual(
    clienteId: number
  ): Promise<
    {
      mes: number;
      nombre: string;
      estado: 'activo' | 'retirado';
      creadoEn?: string;
      totalDelMes: number;
    }[]
  > {
    const ahora = ahoraLima(); // ✅ Hora blindada en zona Lima
    const anio = ahora.year;

    // 📥 Trae todos los retiros del cliente en este año
    const retiros = await this.retiroRepository.find({
      where: { cliente: { id: clienteId }, anio },
    });

    const lista: {
      mes: number;
      nombre: string;
      estado: 'activo' | 'retirado';
      creadoEn?: string;
      totalDelMes: number;
    }[] = [];

    for (let m = 1; m <= ahora.month; m++) {
      const nombreMes = DateTime.fromObject({ month: m }, { zone: 'America/Lima' })
        .setLocale('es')
        .toFormat('MMMM');

      const retiro = retiros.find(r => r.mes === m);

      let creadoEn: string | undefined;

      // 💰 Consulta cuotas del mes en zona Lima — SIEMPRE
      const cuotasDelMes = await this.retiroRepository.manager.query(
        `
        SELECT cuota FROM cuota
        WHERE "clienteId" = $1
          AND EXTRACT(MONTH FROM "creadoEn" AT TIME ZONE 'America/Lima') = $2
          AND EXTRACT(YEAR FROM "creadoEn" AT TIME ZONE 'America/Lima') = $3
        `,
        [clienteId, m, anio]
      );

      const totalDelMes = cuotasDelMes.reduce(
        (total, c) => total + (Number(c.cuota) || 0),
        0
      );

      if (retiro) {
        creadoEn = toISOConZonaLima(retiro.creadoEn); // ✅ Fecha trazada sin desfase
      }

      lista.push({
        mes: m,
        nombre: nombreMes,
        estado: retiro ? 'retirado' : 'activo',
        creadoEn,
        totalDelMes,
      });
    }

    return lista;
  }






  create(retirarMesDto: RetirarMesDto) {
    return 'This action adds a new retiroMe';
  }

  findAll() {
    return `This action returns all retiroMes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} retiroMe`;
  }

}
