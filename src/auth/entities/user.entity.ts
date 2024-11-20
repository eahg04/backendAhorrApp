import { Package } from "src/package/entities/package.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('Users')
export class User {


    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column("text", { unique: true })
    email: string;


    @Column("text", {
        select: false,
    })
    password: string;



    @Column("bool", { default: true })
    isActive: boolean;


    @Column("text", {
        array: true,
        default: ['user']
    })
    roles: string[];

    @OneToMany(
        () => Package,
        (packages) => packages.user,
    )
    package: Package;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        if (process.env.NODE_ENV !== 'test') {
            this.email = this.email.toLowerCase().trim();
        }
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.email = this.email.toLowerCase().trim();
    }
}
