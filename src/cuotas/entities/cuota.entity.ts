import { Cliente } from "src/clientes/entities/cliente.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TipoPago } from "src/enums/tipo-pago.enum";

@Entity()
export class Cuota {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    cuota: number;

    // Definiré manualmente, ya no depende del reloj del servidor
    @Column({ type: 'timestamp' })
    creadoEn: Date;

    @Column({ type: 'timestamp' })
    actualizadoEn: Date;

    @ManyToOne(() => Cliente, cliente => cliente.cuotas, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clienteId' })
    cliente: Cliente;

    @Column({ type: 'enum', enum: TipoPago, default: TipoPago.EFECTIVO
    })
    tipoPago: TipoPago;

}