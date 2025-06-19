import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

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
    const cliente = await this.clienteRepository.findOne({ where: { id }, relations: ['cuotas'] });
    if (!cliente) return null;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    // 📌 **Consulta optimizada con ordenamiento ascendente**
    const cuotasDelMes = await this.cuotaRepository.find({
      where: {
        cliente: { id },
        creadoEn: Raw(alias => `EXTRACT(MONTH FROM ${alias}) = ${month} 
                                AND EXTRACT(YEAR FROM ${alias}) = ${year}`)
      },
      order: { creadoEn: 'ASC' }
    });

    // 📌 **Mapear cuotas según el día**
    const cuotasMap = new Map<number, number>();
    cuotasDelMes.forEach(cuota => {
      const dia = new Date(cuota.creadoEn).getDate();
      cuotasMap.set(dia, cuota.importe);
    });

    // 📌 **Crear respuesta con días faltantes llenados con `0`**
    const cuotasCompletas = Array.from({ length: daysInMonth }, (_, i) => {
      const nuevaCuota = new Cuota();
      nuevaCuota.creadoEn = new Date(year, month - 1, i + 1); // 📌 Asegura que sea una fecha válida
      nuevaCuota.importe = cuotasMap.get(i + 1) ?? 0; // 📌 Asegura que sea un número válido
      nuevaCuota.cliente = cliente;
      return nuevaCuota;
    });

    // 📌 Calcular la suma total de las cuotas del mes
    const totalCuotasMes = cuotasDelMes.reduce((total, cuota) => total + (Number(cuota.importe) || 0), 0);



    // 📌 **Evitar referencia circular eliminando la relación en la respuesta**
    return {
      id: cliente.id,
      dni: cliente.dni,
      nombres: cliente.nombres,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      lugarNacimiento: cliente.lugarNacimiento,
      telefono2: cliente.telefono2,
      cumpleanos: cliente.cumple,
      cuotas: cuotasCompletas, // 🔥 Evita referencia circular al devolver solo datos planos
      totalCuotasMes // 🔥 Agrega la suma total de las cuotas del mes
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
