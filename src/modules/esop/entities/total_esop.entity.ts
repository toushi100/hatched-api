import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { CompanyEntity } from "../../company/entities/company.entity";

@Entity("total_esop")
export class TotalESOPEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "total_esop_id",
    })
    @Expose()
    public id: number;

    @Column({ name: "total_allocated_shares", nullable: false, type: "float" })
    @Expose()
    public totalAllocatedShares: number;

    @OneToOne(() => CompanyEntity, (company) => company.totalESOPsShares, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    public company: CompanyEntity;
}
