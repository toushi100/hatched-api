import { Injectable } from "@nestjs/common";
import { ClassType } from "class-transformer-validator";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { PendingInvitationDto } from "../dto/response/pending-invitation.dto";
import { PendingInvitationEntity } from "../entities/pending_invitation.entity";

@Injectable()
export class PendingInvitationMapper extends AbstractMapper<PendingInvitationDto, PendingInvitationEntity> {
    fromEntityToDTO(
        destination: ClassType<PendingInvitationDto>,
        sourceObject: PendingInvitationEntity,
    ): PendingInvitationDto {
        return {
            invitationId: sourceObject.id,
            email: sourceObject.inviteeEmail,
        };
    }
}
