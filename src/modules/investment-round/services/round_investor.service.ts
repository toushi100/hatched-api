import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../constants/languages";
import { RoundInvestorRepository } from "../repositories/round-investor.repository";
import { CompanyService } from "../../company/services/company.service";
import { RoundInvestorEntity } from "../entities/round-investor.entity";
import { InvestorRoundInvestmentMapper } from "../mapper/investment_round_investor.mapper";
import { GetInvestorInvestmentsListDto } from "../dto/response/get_investor_investments_list.dto";
import { RoundInvestorKeys } from "../translate.enum";

@Injectable()
export class RoundInvestorService {
    constructor(
        public readonly roundInvestorRepository: RoundInvestorRepository,
        public readonly investorRoundInvestmentMapper: InvestorRoundInvestmentMapper,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
    ) {}

    public async getRoundInvestorByEmailAndCompanyId(
        email: string,
        companyId: number,
        language: string,
        asEntity = false,
    ): Promise<GetInvestorInvestmentsListDto | RoundInvestorEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const investor = await this.roundInvestorRepository.findOne({
            where: { email, company: { id: companyId } },
            relations: ["company", "investments", "investments.investmentRound"],
        });

        if (!investor) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(RoundInvestorKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (asEntity) return investor;

        return this.investorRoundInvestmentMapper.fromEntityToInvestorWithInvestmentsListDTO(
            GetInvestorInvestmentsListDto,
            investor,
        );
    }

    public async getInvestmentsSumByCompanyId(companyId: number, language: string): Promise<number> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const query = this.roundInvestorRepository
                .createQueryBuilder("investor")
                .leftJoin("investor.company", "company")
                .leftJoinAndSelect("investor.investments", "investments")
                .select("SUM(investments.shares)", "totalInvestmentsShares")
                .where("company.id = :companyId", { companyId });
            const result = await query.getRawOne();

            return parseFloat(result.totalInvestmentsShares) || 0;
        } catch (e) {
            console.error("Couldn't fetch investments sum. Error: ", e);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(RoundInvestorKeys.UPDATE_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}
