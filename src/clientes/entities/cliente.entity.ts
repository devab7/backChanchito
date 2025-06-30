import { Cuota } from "src/cuotas/entities/cuota.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Cliente {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({ type: 'varchar', unique: true, length: 8 })
    dni: string;

    @Column({ type: 'varchar', unique: true, length: 100 })
    nombres: string;

    @Column({ type: 'char', unique: true, length: 9 })
    telefono: string;

    @Column({ type: 'varchar', nullable: true })
    direccion: string;

    @Column({ type: 'varchar', nullable: true })
    lugarNacimiento: string;

    @Column({ type: 'char', length: 9, unique: true, nullable: true })
    telefono2?: string;

    @Column({ type: 'date', nullable: true })
    cumple: Date | null;

    // @CreateDateColumn({ type: 'timestamp' }) // generates the creation date automatically
    // creadoEn: Date;

    // @UpdateDateColumn({ type: 'timestamp' }) // generates the update date automatically
    // actualizadoEn: Date;

    @Column({ type: 'timestamp' })
    creadoEn: Date;

    @Column({ type: 'timestamp' })
    actualizadoEn: Date;


    @OneToMany(() => Cuota, cuota => cuota.cliente)
    cuotas: Cuota[];

}


