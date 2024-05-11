import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { UserEmailVerificationCodeEntity } from "../entities/user-email-verification-code.entity";

@EntityRepository(UserEmailVerificationCodeEntity)
export class UserEmailVerificationCodeRepository extends Repository<UserEmailVerificationCodeEntity> {
}
