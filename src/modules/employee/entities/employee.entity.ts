import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { IsFounder, IsOrganizationHead } from "../types/founder.type";
import { DepartmentEntity } from "src/modules/department/entities/department.entity";
import { ESOPEntity } from "src/modules/esop/entities/esop.entity";
import { EmployeeVestedYearsEntity } from "./employee_vested_years.entity";

@Entity("employee")
export class EmployeeEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "employee_id",
    })
    @Expose()
    id: number;

    @Expose()
    @Column({
        name: "full_name",
        type: "varchar",
        nullable: false,
    })
    fullName: string;

    @Expose()
    @Column({
        name: "birth_date",
        type: "timestamp",
        nullable: false,
    })
    birthDate: Date;

    @Expose()
    @Column({
        name: "phone",
        type: "varchar",
        nullable: false,
    })
    phone: string;

    @Expose()
    @Column({
        name: "tax_no",
        type: "varchar",
        nullable: false,
    })
    taxNo: string;

    @Expose()
    @Column({
        name: "social_security",
        type: "varchar",
        nullable: false,
    })
    socialSecurity: string;

    @Expose()
    @Column({
        name: "email",
        unique: true,
        nullable: false,
    })
    email: string;

    @Expose()
    @Column({
        name: "yearly_salary",
        type: "float",
        nullable: false,
    })
    yearlySalary: number;

    @Expose()
    @Column({
        name: "monthly_cost",
        type: "float",
        nullable: false,
    })
    monthlyCost: number;

    @Expose()
    @Column({
        name: "children_below_18",
        type: "int",
        nullable: false,
        default: 0,
    })
    childrenBelow18: number;

    @Expose()
    @Column({
        name: "start_date",
        type: "timestamp",
        nullable: false,
    })
    startDate: Date;

    @Expose()
    @Column({
        name: "end_date",
        type: "timestamp",
        nullable: true,
    })
    endDate: Date;

    @Expose()
    @Column({
        name: "is_founder",
        enum: IsFounder,
        nullable: false,
    })
    isFounder: IsFounder;

    @Expose()
    @Column({
        name: "shares_allocated",
        type: "float",
        nullable: false,
    })
    sharesAllocated: number;

    @Expose()
    @Column({
        name: "shares_vested",
        type: "float",
        nullable: false,
        default: 0,
    })
    sharesVested: number;

    @Column({
        name: "title",
        type: "varchar",
        nullable: false,
    })
    @Expose()
    title: string;

    @Expose()
    @Column({
        name: "is_organization_head",
        type: "enum",
        enum: IsOrganizationHead,
        nullable: false,
        default: IsOrganizationHead.no,
    })
    isOrganizationHead: IsOrganizationHead;

    @Column({ nullable: true })
    public reportingToId?: number;

    @ManyToOne(() => EmployeeEntity, (employee) => employee.id, {
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "reportingToId" })
    public reportingTo?: EmployeeEntity;

    @ManyToOne(() => DepartmentEntity, (department) => department.employees, {
        cascade: true,
        onDelete: "NO ACTION",
    })
    @JoinColumn({ name: "department_id" })
    public department: DepartmentEntity;

    @ManyToOne(() => ESOPEntity, (esop) => esop.employees, {
        cascade: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "esop_plan_id" })
    public esop: ESOPEntity;

    @OneToOne(() => EmployeeVestedYearsEntity, (vestedYears) => vestedYears.employee)
    public vestedYears: EmployeeVestedYearsEntity;
}
