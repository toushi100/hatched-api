import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { CompanyEntity } from "src/modules/company/entities/company.entity";

@Entity("pending_invitation")
export class PendingInvitationEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: "invitation_id" })
    id?: number;

    @ManyToOne(() => CompanyEntity, (company) => company.pendingInvitations, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "inviter_company_id" })
    public inviterCompany: CompanyEntity;

    @Column({ name: "invitee_email" })
    @Expose()
    public inviteeEmail: string;
}
