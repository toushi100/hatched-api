import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../../common/abstract.entity";
import { UserRoleEntity } from "./role.entity";
import { UserEmailVerificationCodeEntity } from "./user-email-verification-code.entity";
import { AccountType } from "../account-type.enum";
import { CompanyEntity } from "../../../company/entities/company.entity";
import { AcceleratorEntity } from "src/modules/accelerator/entities/accelerator.entity";

@Entity("user")
export class UserEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: "user_id" })
    id?: number;

    @Column({ name: "first_name" })
    @Expose()
    firstName: string;

    @Column({ name: "last_name" })
    @Expose()
    lastName: string;

    @Column({ unique: true })
    @Expose()
    email: string;

    @Column({ name: "is_email_verified", default: false })
    @Expose()
    isEmailVerified: boolean;

    @Column()
    password: string;

    // @Column({ unique: true })
    // @Expose()
    // username: string;

    @Column({ nullable: true })
    @Expose()
    phone?: string;

    @Column({ nullable: true })
    @Expose()
    nationality?: string;

    @Column({ name: "tax_no", nullable: true })
    @Expose()
    taxNo?: string;

    @Column({ name: "job_title", nullable: true })
    @Expose()
    jobTitle?: string;

    @Column({ name: "account_type", type: "enum", enum: AccountType })
    @Expose()
    public accountType: AccountType;

    @OneToOne(() => CompanyEntity, (company) => company.user, {
        cascade: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "company_id" })
    @Expose()
    company: CompanyEntity;

    @OneToOne(() => AcceleratorEntity, (accelerator) => accelerator.user, {
        cascade: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "accelerator_id" })
    @Expose()
    accelerator: AcceleratorEntity;

    @Column({ name: "refresh_token", nullable: true })
    refreshToken: string;

    @Column({ name: "access_token", nullable: true })
    accessToken: string;

    @ManyToMany((_type) => UserRoleEntity, { cascade: true })
    @JoinTable()
    public roles: UserRoleEntity[];

    @OneToOne(() => UserEmailVerificationCodeEntity, (userEmailVerificationCode) => userEmailVerificationCode.user)
    userEmailVerificationCode: UserEmailVerificationCodeEntity;

    @ManyToMany(() => CompanyEntity, (company) => company.investors, {
        onDelete: "CASCADE",
    })
    public investmentPortfolioCompanies: CompanyEntity[];
}
