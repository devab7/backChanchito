import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCuotaDto } from './dto/create-cuota.dto';
import { UpdateCuotaDto } from './dto/update-cuota.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cuota } from './entities/cuota.entity';
import { Raw, Repository } from 'typeorm';
import { Cliente } from 'src/clientes/entities/cliente.entity';

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
      const cliente = await this.clienteRepository.findOneBy({ id: createCuotaDto.clienteId });
      if (!cliente) throw new NotFoundException('Cliente no encontrado');

      const today = new Date();
      today.setHours(0, 0, 0, 0); // 📌 Normaliza la fecha para comparar sin horas

      // Verificar si ya existe una cuota en el día actual
      const cuotaExistente = await this.cuotaRepository.findOne({
        where: {
          cliente: { id: createCuotaDto.clienteId },
          creadoEn: Raw(alias => `DATE(${alias}) = DATE(:today)`, { today })
        }
      });

      if (cuotaExistente) {
        throw new ConflictException({
          message: `${cliente.nombres} ya registró una cuota hoy`,          
          statusCode: 409
        });
      }

      // 🚀 **Crear nueva cuota**
      const cuota = this.cuotaRepository.create({
        importe: createCuotaDto.importe,
        cliente
      });

      return await this.cuotaRepository.save(cuota);
    } catch (error) {
      throw error; // 📌 Se lanza el error para que el controlador lo maneje
    }
  }



  findAll() {
    const cuotas = this.cuotaRepository.find({ order: { creadoEn: 'DESC' }}); 
    return cuotas;
  }

  async findAllCuotasDelDia() {
    const today = new Date(); // 📅 Hora del servidor
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    const startOfDay = new Date(year, month, day, 0, 0, 0);   // 00:00
    const endOfDay = new Date(year, month, day, 23, 59, 59);  // 23:59

    const cuotasDelDia = await this.cuotaRepository.find({
      where: {
        creadoEn: Raw(alias =>
          `${alias} BETWEEN TIMESTAMP '${startOfDay.toISOString()}' AND TIMESTAMP '${endOfDay.toISOString()}'`
        )
      },
      relations: ['cliente'], // opcional: incluye el cliente relacionado
      order: { creadoEn: 'ASC' }
    });

    const totalDelDia = cuotasDelDia.reduce(
      (sum, cuota) => sum + (Number(cuota.importe) || 0),
      0
    ).toFixed(2);

    return {
      fecha: today.toISOString().slice(0, 10),
      totalCuotasDelDia: totalDelDia,
      cuotas: cuotasDelDia
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
