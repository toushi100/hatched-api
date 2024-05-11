import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    InternalServerErrorException,
    forwardRef,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../constants/languages";
import { CaptableItemDto } from "./dto/response/captable_item.dto";
import { UserPayloadDto } from "../core/user/dto/user-payload.dto";
import { ExistingSharesDto } from "./dto/response/existing_shares.dto";
import { InvestmentRoundService } from "../investment-round/services/investment_round.service";
import { InvestmentRoundName } from "../investment-round/types/InvestmentRoundName.enum";
import { EmployeeService } from "../employee/employee.service";
import { CompanyService } from "../company/services/company.service";
import { ESOPService } from "../esop/esop.service";
import { CapDataRows } from "./types/CapDataReturn.type";
import { CaptableKeys } from "./translate.enum";
import { RoundInvestorService } from "../investment-round/services/round_investor.service";
import { CompanyEntity } from "../company/entities/company.entity";

@Injectable()
export class CaptableService {
    constructor(
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        @Inject(forwardRef(() => InvestmentRoundService))
        public readonly investmentRoundService: InvestmentRoundService,
        public readonly roundInvestorService: RoundInvestorService,
        public readonly employeeService: EmployeeService,
        public readonly esopService: ESOPService,
        private readonly i18n: I18nService,
    ) {}

    private async calculateInvestorsCapData(
        company: CompanyEntity,
        captableRows: CaptableItemDto[],
        totalRowData: CaptableItemDto,
        language: string,
    ): Promise<CapDataRows> {
        try {
            const investmentRoundsList = await this.investmentRoundService.getCompanyInvestmentRounds(
                company,
                language,
            );
            if (investmentRoundsList.totalCount > 0) {
                investmentRoundsList.investmentRounds.forEach((round) => {
                    if (round.roundClosingDate && round.status === "Closed") {
                        round.investors.forEach((investor) => {
                            const invIndex = captableRows.findIndex((row) => row.email === investor.email);
                            if (invIndex > -1) {
                                if (round.name === InvestmentRoundName.Incorporation) {
                                    captableRows[invIndex].incorporation += investor.shares;
                                    totalRowData.incorporation += investor.shares;
                                } else if (round.name === InvestmentRoundName.Round1) {
                                    captableRows[invIndex].round1 += investor.shares;
                                    totalRowData.round1 += investor.shares;
                                } else if (round.name === InvestmentRoundName.Round2) {
                                    captableRows[invIndex].round2 += investor.shares;
                                    totalRowData.round2 += investor.shares;
                                } else if (round.name === InvestmentRoundName.Round3) {
                                    captableRows[invIndex].round3 += investor.shares;
                                    totalRowData.round3 += investor.shares;
                                } else if (round.name === InvestmentRoundName.Round4) {
                                    captableRows[invIndex].round4 += investor.shares;
                                    totalRowData.round4 += investor.shares;
                                }
                                captableRows[invIndex].shares += investor.shares;
                            } else {
                                const investorCapRowData: CaptableItemDto = {
                                    name: investor.investorName,
                                    email: investor.email,
                                    shares: investor.shares,
                                    percentage: 0,
                                    votingPercentage: 0,
                                    incorporation: null,
                                    round1: null,
                                    round2: null,
                                    round3: null,
                                    round4: null,
                                    esop: null,
                                };
                                if (round.name === InvestmentRoundName.Incorporation) {
                                    investorCapRowData.incorporation += investor.shares;
                                    totalRowData.incorporation += investor.shares;
                                } else if (round.name === InvestmentRoundName.Round1) {
                                    investorCapRowData.round1 += investor.shares;
                                    totalRowData.round1 += investor.shares;
                                } else if (round.name === InvestmentRoundName.Round2) {
                                    investorCapRowData.round2 += investor.shares;
                                    totalRowData.round2 += investor.shares;
                                } else if (round.name === InvestmentRoundName.Round3) {
                                    investorCapRowData.round3 += investor.shares;
                                    totalRowData.round3 += investor.shares;
                                } else if (round.name === InvestmentRoundName.Round4) {
                                    investorCapRowData.round4 += investor.shares;
                                    totalRowData.round4 += investor.shares;
                                }
                                captableRows.push(investorCapRowData);
                            }
                        });
                    }
                });
            }
            return { captableRows, totalRowData };
        } catch (e) {
            console.error("Couldn't calculate investors captable data. Error: ", e);
            throw new InternalServerErrorException(
                await this.i18n.translate(CaptableKeys.INVESTORS_DATA_ERROR, { lang: language }),
            );
        }
    }

    private async calculateEmployeesCapData(
        company: CompanyEntity,
        captableRows: CaptableItemDto[],
        totalRowData: CaptableItemDto,
        language: string,
    ): Promise<CapDataRows> {
        try {
            const companyEmployees = await this.employeeService.getCompanyEmployees(company.id);

            companyEmployees.forEach((employee) => {
                if (employee.esop && employee.sharesAllocated > 0) {
                    const empIndex = captableRows.findIndex((row) => row.email === employee.email);
                    if (empIndex > -1) {
                        captableRows[empIndex].esop += employee.sharesAllocated;
                        totalRowData.esop += employee.sharesAllocated;
                    } else {
                        const employeeCapRowData: CaptableItemDto = {
                            name: employee.fullName,
                            email: employee.email,
                            shares: 0,
                            percentage: 0,
                            votingPercentage: 0,
                            incorporation: null,
                            round1: null,
                            round2: null,
                            round3: null,
                            round4: null,
                            esop: employee.sharesAllocated,
                        };
                        captableRows.push(employeeCapRowData);
                    }
                }
            });
            return { captableRows, totalRowData };
        } catch (e) {
            console.error("Couldn't calculate employees captable data. Error: ", e);
            throw new InternalServerErrorException(
                await this.i18n.translate(CaptableKeys.EMPLOYEES_DATA_ERROR, { lang: language }),
            );
        }
    }

    private async calculateESOPRowData(company: CompanyEntity, language: string): Promise<CaptableItemDto> {
        try {
            const esopSharesData = await this.esopService.getCompanySharesDataForESOPs(company, language);

            const esopRowData: CaptableItemDto = {
                name: "ESOP",
                email: "",
                shares: esopSharesData.allocatedToAllPlans,
                percentage: 0,
                votingPercentage: null,
                incorporation: null,
                round1: null,
                round2: null,
                round3: null,
                round4: null,
                esop: esopSharesData.notAllocated,
            };

            return esopRowData;
        } catch (e) {
            console.error("Couldn't calculate ESOP row data. Error: ", e);
            throw new InternalServerErrorException(
                await this.i18n.translate(CaptableKeys.ESOP_DATA_ERROR, { lang: language }),
            );
        }
    }

    private async calculatePercentagesAndTotalValues(
        captableRows: CaptableItemDto[],
        totalRowData: CaptableItemDto,
        language: string,
    ): Promise<CaptableItemDto[]> {
        try {
            const totalShares = captableRows.reduce((accumulator, row) => accumulator + row.shares, 0);
            const esopRow = captableRows.find((row) => row.name === "ESOP");
            const totalSharesLessESOP = totalShares - esopRow.shares;

            captableRows.forEach((row) => {
                const percentage = ((row.shares / totalShares) * 100).toFixed(2);
                row.percentage = Number(percentage);
                if (row.name !== "ESOP") {
                    const votingPercentage = ((row.shares / totalSharesLessESOP) * 100).toFixed(1);
                    row.votingPercentage = Number(votingPercentage);
                }
            });

            const totalPercentage = captableRows.reduce((accumulator, row) => accumulator + row.percentage, 0);
            const totalVotingPercentage = captableRows.reduce(
                (accumulator, row) => accumulator + row.votingPercentage,
                0,
            );

            totalRowData.shares = totalShares;
            totalRowData.percentage = Math.round(totalPercentage);
            totalRowData.votingPercentage = Math.round(totalVotingPercentage);
            totalRowData.esop = captableRows.reduce((accumulator, row) => accumulator + row.esop, 0);
            captableRows.push(totalRowData);

            return captableRows;
        } catch (e) {
            console.error("Couldn't calculate percentages or total values. Error: ", e);
            throw new InternalServerErrorException(
                await this.i18n.translate(CaptableKeys.TOTAL_CALCULATIONS_ERROR, { lang: language }),
            );
        }
    }

    public async getCaptableData(userPayload: UserPayloadDto, language: string): Promise<CaptableItemDto[]> {
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, language);
        return this.getCompanyCaptableData(userCompany, language);
    }

    public async getCompanyCaptableData(company: CompanyEntity, language: string): Promise<CaptableItemDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            let captableRows: CaptableItemDto[] = [];
            let totalRowData: CaptableItemDto = {
                name: "TOTAL",
                email: "",
                shares: 0,
                percentage: 0,
                votingPercentage: 0,
                incorporation: 0,
                round1: 0,
                round2: 0,
                round3: 0,
                round4: 0,
                esop: 0,
            };

            const investorsModifiedData = await this.calculateInvestorsCapData(
                company,
                captableRows,
                totalRowData,
                languageCode,
            );

            const employeesModifiedData = await this.calculateEmployeesCapData(
                company,
                investorsModifiedData.captableRows,
                investorsModifiedData.totalRowData,
                languageCode,
            );
            captableRows = employeesModifiedData.captableRows;
            totalRowData = employeesModifiedData.totalRowData;

            const esopRowData = await this.calculateESOPRowData(company, languageCode);
            captableRows.push(esopRowData);

            const finalCaptableData = await this.calculatePercentagesAndTotalValues(
                captableRows,
                totalRowData,
                languageCode,
            );

            return finalCaptableData;
        } catch (e) {
            console.error("Couldn't calculate captable data correctly. Error: ", e);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(CaptableKeys.CAPTABLE_DATA_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async getExistingSharesNumbers(companyId: number, language: string): Promise<ExistingSharesDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const investorsShares = await this.roundInvestorService.getInvestmentsSumByCompanyId(
                companyId,
                languageCode,
            );
            const esopTotalShares = await this.esopService.getCompanyTotalESOPShares(companyId, languageCode);
            return {
                existingShares: investorsShares + esopTotalShares,
                existingSharesLessESOP: investorsShares,
            } as ExistingSharesDto;
        } catch (e) {
            console.error(`Couldn't get existing shares data: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    { message: await this.i18n.translate(CaptableKeys.CAPTABLE_DATA_ERROR, { lang: languageCode }) },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}
