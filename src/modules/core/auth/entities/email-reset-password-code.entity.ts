import { Expose } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../../common/abstract.entity";

@Entity("email-reset-password-code")
export class EmailResetPasswordCodeEntity extends AbstractEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Expose()
    email: string;

    @Column({ nullable: false })
    @Expose()
    verificationCode: string;
}
