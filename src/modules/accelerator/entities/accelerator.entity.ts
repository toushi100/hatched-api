import { Expose } from "class-transformer";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { UserEntity } from "../../core/user/entities/user.entity";
import { CompanyEntity } from "src/modules/company/entities/company.entity";

@Entity("accelerator")
export class AcceleratorEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: "accelerator_id" })
    id?: number;

    @Column()
    @Expose()
    name: string;

    @Column({ nullable: true })
    @Expose()
    title: string;

    @OneToOne(() => UserEntity, (user) => user.accelerator)
    public user: UserEntity;

    @OneToMany(() => CompanyEntity, (company) => company.accelerator)
    public companies: CompanyEntity[];
}
