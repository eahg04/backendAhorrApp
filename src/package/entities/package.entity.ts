import { User } from "src/auth/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('Package')
export class Package {

    @PrimaryGeneratedColumn('uuid')
    id: string;



    @ManyToOne(
        () => User,
        (user) => user.package,
        { onDelete: 'CASCADE', eager: true }
    )
    user: User;
}
