import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../../constants/languages";
import { InvestmentRoundKeys } from "../translate.enum";
import { InvestmentRoundRepository } from "../repositories/investment_round.repository";
import { CreateInvestmentRoundDto } from "../dto/request/create_investment_round.dto";
import { CreatedInvestmentRoundMapper } from "../mapper/created_investment_round.mapper";
import { CreatedInvestmentRoundDto } from "../dto/response/created_investment_round.dto";
import { UpdateInvestmentRoundDto } from "../dto/request/update_investment_round.dto";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { InvestmentRoundsListDto } from "../dto/response/investment_rounds_list.dto";
import { UserPayloadDto } from "../../core/user/dto/user-payload.dto";
import { CompanyService } from "../../company/services/company.service";
import { CompanyKeys } from "../../company/translate.enum";
import { RoundInvestorService } from "./round_investor.service";
import { GetCompanyInvestmentNumbersDto } from "../dto/response/get_company_investment_numbers.dto";
import { CaptableService } from "../../captable/captable.service";
import { ValuationService } from "../../valuation/valuation.service";
import { ValuationType } from "../../valuation/types/valuation_type.enum";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { InvestmentRoundName } from "../types/InvestmentRoundName.enum";
import { InvestmentRoundEntity } from "../entities/investment-round.entity";

@Injectable()
export class InvestmentRoundService {
    constructor(
        public readonly investmentRoundRepository: InvestmentRoundRepository,
        public readonly createdInvestmentRoundMapper: CreatedInvestmentRoundMapper,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly roundInvestorService: RoundInvestorService,
        @Inject(forwardRef(() => CaptableService))
        public readonly captableService: CaptableService,
        public readonly valuationService: ValuationService,
    ) {}

    public async getInvestmentRounds(userPayload: UserPayloadDto, language: string): Promise<InvestmentRoundsListDto> {
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, language);
        return this.getCompanyInvestmentRounds(userCompany, language);
    }

    public async getCompanyInvestmentRounds(
        company: CompanyEntity,
        language: string,
    ): Promise<InvestmentRoundsListDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const [dbInvestmentRounds, totalCount] = await this.investmentRoundRepository.findAndCount({
                relations: ["company", "company.user", "investorInvestments", "investorInvestments.investor"],
                where: {
                    company: company,
                },
                order: { createdAt: "ASC" },
            });

            const investmentRounds: CreatedInvestmentRoundDto[] = [];
            dbInvestmentRounds.forEach((round) => {
                const dto = this.createdInvestmentRoundMapper.fromEntityToDTO(CreatedInvestmentRoundDto, round);
                investmentRounds.push(dto);
            });

            return { investmentRounds, totalCount };
        } catch (e) {
            console.log(`Can't get investment rounds list: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(InvestmentRoundKeys.GET_LIST_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getInvestmentRoundById(
        investmentRoundId: number,
        language: string,
    ): Promise<CreatedInvestmentRoundDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const investmentRound = await this.investmentRoundRepository.findOne(investmentRoundId, {
            relations: ["investorInvestments", "investorInvestments.investor"],
        });

        if (!investmentRound) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(InvestmentRoundKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return this.createdInvestmentRoundMapper.fromEntityToDTO(CreatedInvestmentRoundDto, investmentRound);
    }

    private isNewRoundInCorrectOrder(
        roundName: InvestmentRoundName,
        companyRounds: CreatedInvestmentRoundDto[],
    ): boolean {
        let hasIncorporation = false,
            hasRound1 = false,
            hasRound2 = false,
            hasRound3 = false;

        companyRounds.forEach((round) => {
            if (round.name === InvestmentRoundName.Incorporation) hasIncorporation = true;
            else if (round.name === InvestmentRoundName.Round1) hasRound1 = true;
            else if (round.name === InvestmentRoundName.Round2) hasRound2 = true;
            else if (round.name === InvestmentRoundName.Round3) hasRound3 = true;
        });

        if (roundName === InvestmentRoundName.Incorporation && (companyRounds.length > 0 || hasIncorporation))
            return false;
        else if (roundName === InvestmentRoundName.Round1 && (!hasIncorporation || hasRound1 || hasRound2 || hasRound3))
            return false;
        else if (
            roundName === InvestmentRoundName.Round2 &&
            (!hasIncorporation || !hasRound1 || hasRound2 || hasRound3)
        )
            return false;
        else if (
            roundName === InvestmentRoundName.Round3 &&
            (!hasIncorporation || !hasRound1 || !hasRound2 || hasRound3)
        )
            return false;
        else if (
            (roundName === InvestmentRoundName.SaleOfShares || roundName === InvestmentRoundName.ShareBuyback) &&
            (companyRounds.length === 0 || !hasIncorporation)
        )
            return false;
        return true;
    }

    public async createInvestmentRound(
        userPayload: UserPayloadDto,
        createInvestmentRoundDto: CreateInvestmentRoundDto,
        language: string,
    ): Promise<CreatedInvestmentRoundDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const company = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

            const companyRounds = await this.getCompanyInvestmentRounds(company, languageCode);

            // check that all rounds are closed before adding new round
            const hasCurrentRounds =
                companyRounds.totalCount > 0 &&
                companyRounds.investmentRounds.some((round) => round.status === "Current");

            if (hasCurrentRounds) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(InvestmentRoundKeys.CURRENT_UNEXPORTED_ROUND_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            // check that new round is created in correct order
            if (!this.isNewRoundInCorrectOrder(createInvestmentRoundDto.name, companyRounds.investmentRounds)) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(InvestmentRoundKeys.CREATE_ROUNDS_IN_ORDER_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            const newInvestmentRound = await this.investmentRoundRepository.createInvestmentRound(
                company,
                createInvestmentRoundDto,
            );

            return this.createdInvestmentRoundMapper.fromEntityToDTO(CreatedInvestmentRoundDto, newInvestmentRound);
        } catch (e) {
            console.log(`Can't create investment round: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(InvestmentRoundKeys.CREATION_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    async updateInvestmentRound(
        userPayload: UserPayloadDto,
        investmentRoundId: number,
        updateInvestmentRoundDto: UpdateInvestmentRoundDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;

        const investmentRound = await this.investmentRoundRepository.findOne(investmentRoundId, {
            relations: ["company"],
        });
        if (!investmentRound) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(InvestmentRoundKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
        if (!userCompany) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (userCompany.id !== investmentRound.company.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(InvestmentRoundKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const updatedInvestmentRound = await this.investmentRoundRepository.updateInvestmentRound(
            userCompany,
            investmentRoundId,
            updateInvestmentRoundDto,
        );

        if (!updatedInvestmentRound) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(InvestmentRoundKeys.UPDATE_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(InvestmentRoundKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async deleteInvestmentRound(
        userPayload: UserPayloadDto,
        investmentRoundId: number,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const investmentRound = await this.investmentRoundRepository.findOne(investmentRoundId, {
            relations: ["company"],
        });

        if (!investmentRound) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(InvestmentRoundKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        if (!userCompany) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (userCompany.id !== investmentRound.company.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(InvestmentRoundKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const latestRound = await this.investmentRoundRepository.findOne({
            where: { company: userCompany },
            relations: ["company"],
            order: { createdAt: "DESC" },
        });
        if (latestRound.id !== investmentRound.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(InvestmentRoundKeys.DELETE_LATEST_ROUND_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.investmentRoundRepository.deleteInvestmentRound(investmentRoundId, userCompany);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(InvestmentRoundKeys.DELETED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async getInvestmentRoundCalculatedNumbers(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<GetCompanyInvestmentNumbersDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const { investmentRounds } = await this.getInvestmentRounds(userPayload, language);
            if (investmentRounds.length === 0) {
                return {
                    preMoney: 0,
                    existingShares: 0,
                    existingSharesLessESOP: 0,
                };
            }
            const company = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
            const valuationData = await this.valuationService.getCompanyValuationData(
                company.id,
                { valuationType: ValuationType.ARR },
                languageCode,
            );
            const valueOfBusiness = valuationData.find((item) => item.name === "Value of Business");
            let preMoneyValuation = 0;
            if (valueOfBusiness) {
                const years = Object.keys(valueOfBusiness.data).map(Number);
                const firstYear = Math.min(...years);
                preMoneyValuation = Number(valueOfBusiness.data[firstYear]);
            }
            const captableValues = await this.captableService.getExistingSharesNumbers(company.id, languageCode);

            return {
                preMoney: isNaN(preMoneyValuation) ? 0 : preMoneyValuation,
                existingShares: captableValues.existingShares,
                existingSharesLessESOP: captableValues.existingSharesLessESOP,
            };
        } catch (e) {
            console.error(`Could not fetch investment numbers: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(InvestmentRoundKeys.CALCULATED_NUMBERS_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}
