import { Expose } from "class-transformer";
import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { UserEntity } from "../../core/user/entities/user.entity";
import { DepartmentEntity } from "../../department/entities/department.entity";
import { RevenueItemEntity } from "../../revenue-model/entities/revenue-item.entity";
import { BudgetItemEntity } from "../../budget/budget-item/entities/budget-item.entity";
import { FinancialItemEntity } from "../../financial/entities/financial-item.entity";
import { CompanyPlanDateEntity } from "./company-plan-date.entity";
import { FinancialQuarterRatioEntity } from "src/modules/financial/entities/financial-quarter-ratio.entity";
import { BudgetMonthRatioEntity } from "src/modules/budget/budget-item/entities/budget-month-ratio.entity";
import { ESOPEntity } from "../../esop/entities/esop.entity";
import { AcceleratorEntity } from "src/modules/accelerator/entities/accelerator.entity";
import { PendingInvitationEntity } from "src/modules/company/entities/pending_invitation.entity";
import { InvestmentRoundEntity } from "src/modules/investment-round/entities/investment-round.entity";
import { ItemEntity } from "./item.entity";
import { TotalESOPEntity } from "src/modules/esop/entities/total_esop.entity";

@Entity("company")
export class CompanyEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: "company_id" })
    id?: number;

    @Column()
    @Expose()
    name: string;

    @Column({ nullable: true })
    @Expose()
    logo: string;

    @Column({ nullable: true })
    @Expose()
    website: string;

    @Column({ name: "ios_url", nullable: true })
    @Expose()
    iosURL: string;

    @Column({ name: "play_store_url", nullable: true })
    @Expose()
    playStoreURL: string;

    @Column({ name: "fb_url", nullable: true })
    @Expose()
    fbURL: string;

    @Column({ name: "ig_url", nullable: true })
    @Expose()
    igURL: string;

    @Column({ name: "linkedin_url", nullable: true })
    @Expose()
    linkedinURL: string;

    @Column({ name: "twitter_url", nullable: true })
    @Expose()
    twitterURL: string;

    @Column({
        name: "is_accelerator",
        type: "boolean",
        default: false,
    })
    @Expose()
    isAccelerator: boolean;

    @Column({
        name: "is_investor",
        type: "boolean",
        default: false,
    })
    @Expose()
    isInvestor: boolean;

    @OneToMany(() => DepartmentEntity, (department) => department.company)
    public departments: DepartmentEntity[];

    @OneToOne(() => UserEntity, (user) => user.company)
    public user: UserEntity;

    @OneToMany(() => RevenueItemEntity, (revenueItem) => revenueItem.company)
    public revenueItems: RevenueItemEntity[];

    @OneToMany(() => BudgetItemEntity, (budgetItem) => budgetItem.company)
    public budgetItems: BudgetItemEntity[];

    @OneToMany(() => FinancialItemEntity, (financialItem) => financialItem.company)
    public financialItems: FinancialItemEntity[];

    @OneToOne(() => CompanyPlanDateEntity, (plan) => plan.company)
    public planDate: CompanyPlanDateEntity;

    @OneToMany(() => FinancialQuarterRatioEntity, (financialQuarterRatio) => financialQuarterRatio.company)
    public financialQuarterRatios: FinancialQuarterRatioEntity[];

    @OneToMany(() => BudgetMonthRatioEntity, (budgetMonthRatio) => budgetMonthRatio.company)
    public budgetMonthRatios: BudgetMonthRatioEntity[];

    @OneToMany(() => ESOPEntity, (esop) => esop.company)
    public esops: ESOPEntity[];

    @ManyToOne(() => AcceleratorEntity, (accelerator) => accelerator.companies, {
        cascade: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "accelerator_id" })
    @Expose()
    public accelerator: AcceleratorEntity;

    @OneToMany(() => PendingInvitationEntity, (invitation) => invitation.inviterCompany)
    public pendingInvitations: PendingInvitationEntity[];

    @ManyToMany(() => UserEntity, (investor) => investor.investmentPortfolioCompanies, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinTable({
        name: "company_investors",
        joinColumn: { name: "company_id" },
        inverseJoinColumn: { name: "investor_id" },
    })
    public investors: UserEntity[];

    @OneToMany(() => InvestmentRoundEntity, (investmentRound) => investmentRound.company)
    public investmentRounds: InvestmentRoundEntity[];

    @OneToMany(() => ItemEntity, (item) => item.company)
    public items: ItemEntity[];

    @OneToOne(() => TotalESOPEntity, (totalESOP) => totalESOP.company)
    public totalESOPsShares: TotalESOPEntity;
}
