import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { PendingInvitationRepository } from "../repositories/pending-invitation.repository";
import { I18nService } from "nestjs-i18n";
import { CompanyService } from "./company.service";
import { UserPayloadDto } from "../../core/user/dto/user-payload.dto";
import { PendingInvitationMapper } from "../mapper/pending-invitation.mapper";
import { PendingInvitationDto } from "../dto/response/pending-invitation.dto";
import { PendingInvitationEntity } from "../entities/pending_invitation.entity";
import { SendInvitationsDto } from "../dto/request/send-invitations.dto";
import { BasicOperationsResponse } from "src/common/dto/basic-operations-response.dto";
import { UserService } from "../../core/user/user.service";
import { AccountType } from "../../core/user/account-type.enum";
import { languagesCodes } from "src/constants/languages";
import { AcceleratorService } from "../../accelerator/accelerator.service";
import { UserEntity } from "../../core/user/entities/user.entity";
import { InvitationKeys } from "../translate.enum";
import { EmailService, EmailTemplates } from "src/shared/services/email.service";
import { UpdateAcceleratorAndInvestorsPayload } from "../types/UpdateAcceleratorAndInvestorsPayload";
import { ConfigService } from "../../../configs";

@Injectable()
export class InvitationService {
    constructor(
        public readonly pendingInvitationRepository: PendingInvitationRepository,
        public readonly pendingInvitationMapper: PendingInvitationMapper,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        @Inject(forwardRef(() => UserService))
        public readonly userService: UserService,
        public readonly acceleratorService: AcceleratorService,
        public readonly emailService: EmailService,
        public readonly configService: ConfigService,
    ) { }

    public async getPendingInvitations(userPayload: UserPayloadDto): Promise<PendingInvitationDto[]> {
        const dbInvitations = await this.pendingInvitationRepository.find({
            relations: ["inviterCompany", "inviterCompany.user"],
            where: { inviterCompany: { user: { id: userPayload.id } } },
            order: {
                createdAt: "ASC",
            },
        });

        return dbInvitations.map((inv) => this.pendingInvitationMapper.fromEntityToDTO(PendingInvitationDto, inv));
    }

    public async sendNewInvitations(
        userPayload: UserPayloadDto,
        sendInvitationsDto: SendInvitationsDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const registeredUsers = await this.userService.findUsersByEmails(sendInvitationsDto.invitedInvestorsEmails);

        // throw error if any email is registered as a startup
        if (registeredUsers.some((user) => user.accountType === AccountType.STARTUP)) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(InvitationKeys.REGISTERED_STARTUP_EMAIL_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.EXPECTATION_FAILED,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        const unregisteredEmails = sendInvitationsDto.invitedInvestorsEmails.filter(
            (email) => !registeredUsers.some((user) => user.email === email),
        );

        // add to Pending Invitations table with inviter company id and invitee's email
        const pendingInvitations = unregisteredEmails.map((email) => {
            const invitation = new PendingInvitationEntity();
            invitation.inviteeEmail = email;
            invitation.inviterCompany = userCompany;
            return invitation;
        });

        await this.pendingInvitationRepository.save(pendingInvitations);

        // send invitation emails via SMTP
        const senderEmail = this.configService.ENV_CONFIG.SMTP_SERVER_SENDER_EMAIL;
        const registerPageUrl = `${this.configService.ENV_CONFIG.HATCHED_WEBSITE_URL}/register?source=invitation_email`;
        const subject = `Invitation to access financial info of ${userCompany.name} at Hatched`
        const invitationEmailsPromises = sendInvitationsDto.invitedInvestorsEmails.map((email) =>
            this.emailService.sendEmailThroughSMTP(
                email,
                `'"Hatched Team" <${senderEmail}>'`,
                subject,
                EmailTemplates.EMAIL_INVITATION_TEMPLATE,
                {
                    inviterCompany: userCompany.name,
                    hatchedRegisterUrl: `${registerPageUrl}&email=${email}`,
                },
            ),
        );

        await Promise.all(invitationEmailsPromises);

        let acceleratorUserId: number;
        const investors: UserEntity[] = [];
        registeredUsers.forEach(async (user) => {
            if (user.accountType === AccountType.ACCELERATOR) {
                // save accelerator to the inviter company entity
                acceleratorUserId = user.id;
            } else if (user.accountType === AccountType.INVESTOR) {
                // add a record to the company_investors table
                investors.push(user);
            }
        });

        const updateCompanyPayload: UpdateAcceleratorAndInvestorsPayload = {};
        if (acceleratorUserId) {
            const accelerator = await this.acceleratorService.getAcceleratorByUserId(acceleratorUserId, languageCode);
            updateCompanyPayload.acceleratorId = accelerator.id;
        }
        if (investors.length) {
            updateCompanyPayload.investorsIds = investors.map((inv) => inv.id);
        }
        if (acceleratorUserId || investors.length) {
            await this.companyService.updateCompanyInvestorsAndAccelerator(
                userCompany.id,
                updateCompanyPayload,
                languageCode,
            );
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(InvitationKeys.SENT_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async getPendingInvitationsByEmail(email: string): Promise<PendingInvitationEntity[]> {
        const invitations = await this.pendingInvitationRepository
            .createQueryBuilder("pendingInvitation")
            .leftJoinAndSelect("pendingInvitation.inviterCompany", "inviterCompany")
            .distinctOn(["pendingInvitation.inviteeEmail"])
            .where("pendingInvitation.inviteeEmail = :email", { email })
            .getMany();
        return invitations;
    }

    public async deletePendingInvitationsByEmail(email: string, language: string): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const invitations = await this.pendingInvitationRepository.find({
            where: { inviteeEmail: email },
        });

        if (invitations.length) {
            try {
                const invitationsIds: number[] = invitations.map((inv) => inv.id);
                await this.pendingInvitationRepository.delete(invitationsIds);
                return {
                    isSuccessful: true,
                    message: await this.i18n.translate(InvitationKeys.DELETED_SUCCESSFULLY, {
                        lang: languageCode,
                    }),
                };
            } catch (error) {
                throw new HttpException(
                    { message: await this.i18n.translate(InvitationKeys.CANT_DELETE, { lang: languageCode }) },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(InvitationKeys.NOT_FOUND, { lang: languageCode }),
        };
    }

    public async getPendingInvitationsByUserId(userId: number): Promise<PendingInvitationEntity[]> {
        const invitations = await this.pendingInvitationRepository
            .createQueryBuilder("pendingInvitation")
            .leftJoin("pendingInvitation.inviterCompany", "inviterCompany")
            .leftJoin("inviterCompany.user", "user")
            .distinctOn(["pendingInvitation.inviteeEmail"])
            .where("user.id = :userId", { userId })
            .getMany();
        return invitations;
    }
}
