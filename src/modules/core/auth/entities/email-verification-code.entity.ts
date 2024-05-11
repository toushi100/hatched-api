import { Expose } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../../common/abstract.entity";
import { AccountType } from "../../user/account-type.enum";

@Entity("email-verification-code")
export class EmailVerificationCodeEntity extends AbstractEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    @Expose()
    firstName: string;

    @Column({ nullable: false })
    @Expose()
    lastName: string;

    @Column({ unique: true })
    @Expose()
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: false })
    @Expose()
    verificationCode: string;

    @Column({ type: "enum", enum: AccountType })
    @Expose()
    accountType: AccountType;

    @Column({ nullable: true })
    @Expose()
    companyName?: string;
}
