import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

export enum EmailTemplates {
    EMAIL_VERIFICATION_CODE_TEMPLATE = "./email-verification-code", //.hbs auto added
    EMAIL_VERIFICATION_CODE_SUBJECT = "[Hatched] Please verify your email",
    EMAIL_RESET_PASSWORD_CODE_TEMPLATE = "./email-reset-password-code", //.hbs auto added
    EMAIL_RESET_PASSWORD_CODE_SUBJECT = "[Hatched] Reset password",
    EMAIL_INVITATION_TEMPLATE = "./investor-invitation", //.hbs auto added
    EMAIL_INVITATION_SUBJECT = "[Hatched] You were invited to Hatched",
}

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) { }

    public async sendEmailThroughSMTP(
        to: string,
        from: string,
        subject: string,
        template: string,
        context: { [key: string]: string },
    ): Promise<void> {
        await this.mailerService.sendMail({
            to,
            from,
            subject,
            template, // The `.pug` or `.hbs` extension is appended automatically.
            context,
        });
    }
}
