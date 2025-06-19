import { Cliente } from "src/clientes/entities/cliente.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Cuota {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    importe: number;

    @CreateDateColumn({ type: 'timestamp' }) // generates the creation date automatically
    creadoEn: Date;

    @UpdateDateColumn({ type: 'timestamp' }) // generates the update date automatically
    actualizadoEn: Date;

    @ManyToOne(() => Cliente, cliente => cliente.cuotas, { eager: true })
    @JoinColumn({ name: 'clienteId' })
    cliente: Cliente;

}