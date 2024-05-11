import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { PendingInvitationEntity } from "../entities/pending_invitation.entity";

@EntityRepository(PendingInvitationEntity)
export class PendingInvitationRepository extends AbstractRepository<PendingInvitationEntity> {}
