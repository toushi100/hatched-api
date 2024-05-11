import { Expose } from "class-transformer";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { RevenueItemEntity } from "./revenue-item.entity";

@Entity("revenue_model")
export class RevenueModelEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "revenue_model_id",
    })
    @Expose()
    public id: number;

    @Column()
    @Expose()
    public name: string;

    @Column({
        default: "",
        nullable: true,
    })
    @Expose()
    public description: string;

    @Column({ name: "business_model", default: "SaaS" })
    @Expose()
    public businessModel: string;

    @OneToMany(() => RevenueItemEntity, (revenueItem) => revenueItem.revenueModel)
    public revenueItems: RevenueItemEntity[];
}
