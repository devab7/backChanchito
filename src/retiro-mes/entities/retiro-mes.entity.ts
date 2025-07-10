import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RetiroMes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  creadoEn: Date; // 📌 Usar ahoraLima() al registrar el retiro

  @Column({ type: 'timestamp' })
  actualizadoEn: Date;

  @Column({ type: 'int' })
  anio: number;

  @Column({ type: 'int' })
  mes: number; // 1–12 → representa el mes retirado

  @ManyToOne(() => Cliente, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;
}

