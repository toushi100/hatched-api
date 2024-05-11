import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { EmployeeEntity } from "./employee.entity";

@Entity("employee_vested_years")
export class EmployeeVestedYearsEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "vested_years_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({
        name: "vested_years",
        type: "int",
        nullable: false,
        default: 0,
    })
    vestedYears: number;

    @OneToOne(() => EmployeeEntity, (employee) => employee.vestedYears, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "employee_id" })
    public employee: EmployeeEntity;
}
