import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../../common/abstract.entity";
import { UserEntity } from "./user.entity";

@Entity("user-email-verification-code")
export class UserEmailVerificationCodeEntity extends AbstractEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Expose()
    email: string;

    @Column({ nullable: false })
    @Expose()
    verificationCode: string;

    @OneToOne(() => UserEntity, user => user.userEmailVerificationCode)
    @JoinColumn()
    user: UserEntity;
}
