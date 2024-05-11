import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../constants/languages";
import { UserPayloadDto } from "../core/user/dto/user-payload.dto";
import { CompanyService } from "../company/services/company.service";
import { ValuationService } from "../valuation/valuation.service";
import { GetValuationDto } from "../valuation/dto/request/get_valuation.dto";
import { UserService } from "../core/user/user.service";
import { InvestorKeys } from "./translate.enum";
import { CaptableService } from "../captable/captable.service";
import { CaptableItemDto } from "../captable/dto/response/captable_item.dto";
import { InvestorCompanyListItemDto } from "./dto/response/investor_company_list_item.dto";
import { ValuationItemListDto } from "../valuation/dto/response/valuation_item_list.dto";
import { GetOrgChartQueryDto } from "../company/dto/request/org_chart_query.dto";
import { EmployeeNodeDto } from "../employee/dto/response/org_chart_employee_node.dto";
import { ActualBudgetItemsListDto } from "../profit_and_loss/dto/response/actual_budget_items_list.dto";
import { ProfitLossService } from "../profit_and_loss/services/profit-loss.service";
import { CompanyEntity } from "../company/entities/company.entity";
import { InvestorCompanyInfoDto } from "./dto/response/investor_company_info.dto";

@Injectable()
export class InvestorService {
    constructor(
        public readonly companyService: CompanyService,
        private readonly valuationService: ValuationService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly captableService: CaptableService,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => ProfitLossService))
        public readonly profitLossService: ProfitLossService,
    ) { }

    public async getCompaniesList(
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<InvestorCompanyListItemDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithInvestmentPortfolioCompanies(userPayload.id);

        if (userEntity && userEntity.investmentPortfolioCompanies) {
            return userEntity.investmentPortfolioCompanies
                .map((company) => ({
                    companyId: company.id,
                    name: company.name,
                    logo: company.logo,
                }))
                .sort((a, b) => a.companyId - b.companyId);
        } else {
            throw new HttpException(
                {
                    message: await this.i18n.translate(
                        userEntity ? InvestorKeys.COMPANY_NOT_FOUND : InvestorKeys.NOT_FOUND,
                        {
                            lang: languageCode,
                        },
                    ),
                },
                HttpStatus.NOT_FOUND,
            );
        }
    }

    public async getCompanyById(
        userPayload: UserPayloadDto,
        companyId: number,
        language: string,
    ): Promise<InvestorCompanyInfoDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithInvestmentPortfolioCompanies(userPayload.id);

        if (userEntity && userEntity.investmentPortfolioCompanies) {
            const company = userEntity.investmentPortfolioCompanies.find(item => item.id === companyId);
            if (!company) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(InvestorKeys.COMPANY_NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            return {
                name: company.name,
                logo: company.logo,
            };
        } else {
            throw new HttpException(
                {
                    message: await this.i18n.translate(
                        userEntity ? InvestorKeys.COMPANY_NOT_FOUND : InvestorKeys.NOT_FOUND,
                        {
                            lang: languageCode,
                        },
                    ),
                },
                HttpStatus.NOT_FOUND,
            );
        }
    }

    public async getCompanyValuationData(
        userPayload: UserPayloadDto,
        companyId: number,
        getValuationDto: GetValuationDto,
        language: string,
    ): Promise<ValuationItemListDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithInvestmentPortfolioCompanies(userPayload.id);

        if (userEntity && userEntity.investmentPortfolioCompanies) {
            const isInPortfolio = userEntity.investmentPortfolioCompanies.some((company) => company.id === companyId);

            if (!isInPortfolio) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(InvestorKeys.COMPANY_NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            return this.valuationService.getCompanyValuationData(companyId, getValuationDto, language);
        } else {
            throw new HttpException(
                {
                    message: await this.i18n.translate(
                        userEntity ? InvestorKeys.COMPANY_NOT_FOUND : InvestorKeys.NOT_FOUND,
                        {
                            lang: languageCode,
                        },
                    ),
                },
                HttpStatus.NOT_FOUND,
            );
        }
    }

    public async getCompanyCapTableData(
        userPayload: UserPayloadDto,
        companyId: number,
        language: string,
    ): Promise<CaptableItemDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithInvestmentPortfolioCompanies(userPayload.id);

        if (userEntity && userEntity.investmentPortfolioCompanies) {
            const isInPortfolio = userEntity.investmentPortfolioCompanies.some((company) => company.id === companyId);

            if (!isInPortfolio) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(InvestorKeys.COMPANY_NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
            const userCompany = new CompanyEntity();
            userCompany.id = companyId;

            return this.captableService.getCompanyCaptableData(userCompany, language);
        } else {
            throw new HttpException(
                {
                    message: await this.i18n.translate(
                        userEntity ? InvestorKeys.COMPANY_NOT_FOUND : InvestorKeys.NOT_FOUND,
                        {
                            lang: languageCode,
                        },
                    ),
                },
                HttpStatus.NOT_FOUND,
            );
        }
    }

    public async getCompanyOrganizationChart(
        companyId: number,
        orgChartQueryDto: GetOrgChartQueryDto,
        language: string,
    ): Promise<EmployeeNodeDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const companyOrgChart = await this.companyService.getCompanyOrganizationChart(
                companyId,
                orgChartQueryDto,
                languageCode,
            );
            return companyOrgChart;
        } catch (e) {
            console.error(`Can't get investor's company organization chart: ${e}`);
            throw e; // Re-throw HttpException
        }
    }

    public async getCompanyActualBudgetItems(
        userPayload: UserPayloadDto,
        companyId: number,
        language: string,
    ): Promise<ActualBudgetItemsListDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithInvestmentPortfolioCompanies(userPayload.id);

        if (userEntity && userEntity.investmentPortfolioCompanies) {
            const isInPortfolio = userEntity.investmentPortfolioCompanies.some((company) => company.id === companyId);

            if (!isInPortfolio) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(InvestorKeys.COMPANY_NOT_FOUND, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
            const company: CompanyEntity = new CompanyEntity();
            company.id = companyId;

            return this.profitLossService.getActualBudgetItemsTableDataByCompany(company, language);
        } else {
            throw new HttpException(
                {
                    message: await this.i18n.translate(
                        userEntity ? InvestorKeys.COMPANY_NOT_FOUND : InvestorKeys.NOT_FOUND,
                        {
                            lang: languageCode,
                        },
                    ),
                },
                HttpStatus.NOT_FOUND,
            );
        }
    }
}
