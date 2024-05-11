import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { EmailResetPasswordCodeEntity } from "../entities/email-reset-password-code.entity";

@EntityRepository(EmailResetPasswordCodeEntity)
export class EmailResetPasswordCodeRepository extends Repository<EmailResetPasswordCodeEntity> {}
