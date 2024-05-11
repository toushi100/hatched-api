import { Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { CompanyService } from "./company.service";
import { UserPayloadDto } from "../../core/user/dto/user-payload.dto";
import { BasicOperationsResponse } from "src/common/dto/basic-operations-response.dto";
import { UserService } from "../../core/user/user.service";
import { languagesCodes } from "src/constants/languages";
import { AcceleratorService } from "../../accelerator/accelerator.service";
import { InvestorRelationKeys, InvitationKeys } from "../translate.enum";
import { InvitationService } from "./invitation.service";
import { InvestorRelationDto } from "../dto/response/investor-relation.dto";
import { InvestorRelationMapper } from "../mapper/investor-realtion.mapper";
import { DeleteInvestorRelationDto } from "../dto/request/delete-investor-relation.dto";
import { UpdateInvestorRelationDto } from "../dto/request/update-investor-relation.dto";

@Injectable()
export class InvestorRelationService {
    constructor(
        public readonly investorRelationMapper: InvestorRelationMapper,
        private readonly i18n: I18nService,
        public readonly companyService: CompanyService,
        public readonly userService: UserService,
        public readonly acceleratorService: AcceleratorService,
        public readonly invitationService: InvitationService,
    ) {}

    public async getInvestorRelationsList(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<InvestorRelationDto[]> {
        const investorRelationsDtos: InvestorRelationDto[] = [];

        // get Pending Invitations by company user id
        const pendingInvitations = await this.invitationService.getPendingInvitationsByUserId(userPayload.id);
        pendingInvitations.forEach((inv) => {
            investorRelationsDtos.push(this.investorRelationMapper.fromInvitationEntityToDTO(inv));
        });
        // get company's investors and accelerator
        const { investors, accelerator } = await this.companyService.getCompanyAcceleratorAndInvestors(
            userPayload.id,
            language,
        );
        investors.forEach((inv) => {
            investorRelationsDtos.push(this.investorRelationMapper.fromUserEntityToDTO(inv));
        });
        if (accelerator) {
            investorRelationsDtos.push(this.investorRelationMapper.fromUserEntityToDTO(accelerator.user));
        }

        return investorRelationsDtos;
    }

    public async deleteInvestorRelation(
        userPayload: UserPayloadDto,
        deleteDto: DeleteInvestorRelationDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // if pending, delete Pending Invitation records
        await this.invitationService.deletePendingInvitationsByEmail(deleteDto.email, languageCode);

        // remove company investors records and set company accelerator as NULL
        await this.companyService.deleteCompanyInvestorRelations(userPayload.id, deleteDto.email, languageCode);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(InvitationKeys.DELETED_SUCCESSFULLY, { lang: languageCode }),
        };
    }

    public async updateInvestorRelation(
        userPayload: UserPayloadDto,
        updateInvestorRelationDto: UpdateInvestorRelationDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        // delete all relevant investor relations
        await this.deleteInvestorRelation(userPayload, { email: updateInvestorRelationDto.oldEmail }, languageCode);

        // send new invitation if unregistered email
        await this.invitationService.sendNewInvitations(
            userPayload,
            { invitedInvestorsEmails: [updateInvestorRelationDto.newEmail] },
            languageCode,
        );

        return {
            isSuccessful: true,
            message: await this.i18n.translate(InvestorRelationKeys.UPDATED_SUCCESSFULLY, { lang: languageCode }),
        };
    }
}
