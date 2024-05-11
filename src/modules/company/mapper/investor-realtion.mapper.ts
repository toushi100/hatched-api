import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { PendingInvitationEntity } from "../entities/pending_invitation.entity";
import { InvestorRelationDto } from "../dto/response/investor-relation.dto";
import { UserEntity } from "../../core/user/entities/user.entity";

@Injectable()
export class InvestorRelationMapper extends AbstractMapper<InvestorRelationDto, PendingInvitationEntity | UserEntity> {
    fromInvitationEntityToDTO(sourceObject: PendingInvitationEntity): InvestorRelationDto {
        return {
            email: sourceObject.inviteeEmail,
            date: sourceObject.createdAt.toString(),
        };
    }

    fromUserEntityToDTO(sourceObject: UserEntity): InvestorRelationDto {
        return {
            email: sourceObject.email,
            date: sourceObject.updatedAt.toString(),
        };
    }
}
