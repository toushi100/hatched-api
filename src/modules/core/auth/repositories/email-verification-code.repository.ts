import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { EmailVerificationCodeEntity } from "../entities/email-verification-code.entity";

@EntityRepository(EmailVerificationCodeEntity)
export class EmailVerificationCodeRepository extends Repository<EmailVerificationCodeEntity> {}
