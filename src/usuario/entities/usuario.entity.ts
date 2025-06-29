import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { RolUsuario } from 'src/enums/rol.usuario.enum';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude() // para que no se devuelva al serializar
  password: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.TRABAJADOR
  })
  rol: RolUsuario;
}
