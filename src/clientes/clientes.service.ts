import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { DateTime } from 'luxon';

import { Cliente } from './entities/cliente.entity';
import { Cuota } from 'src/cuotas/entities/cuota.entity';

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
  async create(createClienteDto: CreateClienteDto) {
    
    try {

      const cliente = this.clienteRepository.create(createClienteDto);
      await this.clienteRepository.save( cliente );

      return cliente;
      
    } catch (error) {

      this.handleDBExceptions(error);
      
    }

  }



  // list all clientes
  findAll() {
    
    const clientes = this.clienteRepository.find({ order: { creadoEn: 'DESC' }}); 
    return clientes;

  }



  // find a cliente by id


async findOne(id: number): Promise<any> {
  const cliente = await this.clienteRepository.findOne({
    where: { id },
    relations: ['cuotas']
  });
  if (!cliente) return null;

  // ⏱️ Zona horaria controlada: Lima
  const now = DateTime.now().setZone('America/Lima');
  const year = now.year;
  const month = now.month;
  const daysInMonth = now.daysInMonth;

  // 🔍 Filtra cuotas solo del mes actual usando zona horaria
  const cuotasDelMes = await this.cuotaRepository.find({
    where: {
      cliente: { id },
      creadoEn: Raw(
        alias => `
          EXTRACT(MONTH FROM ${alias} AT TIME ZONE 'America/Lima') = ${month}
          AND EXTRACT(YEAR FROM ${alias} AT TIME ZONE 'America/Lima') = ${year}
        `
      )
    },
    order: { creadoEn: 'ASC' }
  });

  // 🧠 Mapear día → importe
  const cuotasMap = new Map<number, number>();
  cuotasDelMes.forEach(cuota => {
    const fecha = DateTime.fromJSDate(cuota.creadoEn).setZone('America/Lima');
    const dia = fecha.day;
    cuotasMap.set(dia, cuota.importe);
  });

  // 📆 Rellenar días faltantes del mes
  const cuotasCompletas: Cuota[] = Array.from({ length: daysInMonth! }, (_, i) => {
    const nuevaCuota = new Cuota();
    nuevaCuota.creadoEn = new Date(year, month - 1, i + 1);
    nuevaCuota.importe = cuotasMap.get(i + 1) ?? 0;
    nuevaCuota.cliente = cliente;
    return nuevaCuota;
  });


  // 💰 Total del mes
  const totalCuotasMes = cuotasDelMes.reduce(
    (total, cuota) => total + (Number(cuota.importe) || 0),
    0
  );

  // 🎁 Cliente formateado sin relaciones circulares
  return {
    id: cliente.id,
    dni: cliente.dni,
    nombres: cliente.nombres,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    lugarNacimiento: cliente.lugarNacimiento,
    telefono2: cliente.telefono2,
    cumpleanos: cliente.cumple,
    cuotas: cuotasCompletas,
    totalCuotasMes
  };
}





  // delete a cliente by id
  update(id: number, updateClienteDto: UpdateClienteDto) {
    return `This action updates a #${id} cliente`;
  }

  async remove(id: number) {

    const cliente = await this.clienteRepository.delete({ id });

    if (cliente.affected === 0) {
      throw new NotFoundException(`No se encontró el registro con ID ${id}`);
    }

    return { message: 'Registro eliminado correctamente' };

  }

  

  private handleDBExceptions( error: any ) {

    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }

}
