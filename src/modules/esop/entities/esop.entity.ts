import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { CompanyEntity } from "../../company/entities/company.entity";
import { EmployeeEntity } from "src/modules/employee/entities/employee.entity";

@Entity("esop_plan")
export class ESOPEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "esop_plan_id",
    })
    @Expose()
    public id: number;

    @Column()
    @Expose()
    public name: string;

    @Column()
    @Expose()
    public years: number;

    @Column({ name: "year_1", nullable: true })
    @Expose()
    public year1: number;

    @Column({ name: "year_2", nullable: true })
    @Expose()
    public year2: number;

    @Column({ name: "year_3", nullable: true })
    @Expose()
    public year3: number;

    @Column({ name: "year_4", nullable: true })
    @Expose()
    public year4: number;

    @Column({ name: "year_5", nullable: true })
    @Expose()
    public year5: number;

    @ManyToOne(() => CompanyEntity, (company) => company.esops, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    public company: CompanyEntity;

    @OneToMany(() => EmployeeEntity, (employee) => employee.esop)
    public employees: EmployeeEntity[];
}
