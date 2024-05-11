import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../constants/languages";
import { AcceleratorKeys } from "./translate.enum";
import { AcceleratorRepository } from "./repositories/accelerator.repository";
import { CreateAcceleratorDto } from "./dto/request/create_accelerator.dto";
import { AcceleratorItemDto } from "./dto/response/created_accelerator.dto";
import { UpdateAcceleratorDto } from "./dto/request/update_accelerator.dto";
import { AcceleratorEntity } from "./entities/accelerator.entity";
import { CreatedAcceleratorMapper } from "./mapper/created-accelerator.mapper";
import { BasicOperationsResponse } from "../../common/dto/basic-operations-response.dto";
import { CompanyService } from "../company/services/company.service";
import { ValuationService } from "../valuation/valuation.service";
import { UserService } from "../core/user/user.service";
import { CaptableService } from "../captable/captable.service";
import { UserPayloadDto } from "../core/user/dto/user-payload.dto";
import { AcceleratorCompanyListItemDto } from "./dto/response/accelerator_company_list_item.dto";
import { GetValuationDto } from "../valuation/dto/request/get_valuation.dto";
import { CaptableItemDto } from "../captable/dto/response/captable_item.dto";
import { UserKeys } from "../core/user/translate.enum";
import { AcceleratorListItemDto } from "./dto/response/accelerator_list_item.dto";
import { AcceleratorListItemMapper } from "./mapper/accelerator_list_item.mapper";
import { ValuationItemListDto } from "../valuation/dto/response/valuation_item_list.dto";
import { GetOrgChartQueryDto } from "../company/dto/request/org_chart_query.dto";
import { EmployeeNodeDto } from "../employee/dto/response/org_chart_employee_node.dto";
import { ActualBudgetItemsListDto } from "../profit_and_loss/dto/response/actual_budget_items_list.dto";
import { CompanyEntity } from "../company/entities/company.entity";
import { ProfitLossService } from "../profit_and_loss/services/profit-loss.service";
import { AcceleratorCompanyInfoDto } from "./dto/response/accelerator_company_info.dto";
@Injectable()
export class AcceleratorService {
    constructor(
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        private readonly valuationService: ValuationService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly captableService: CaptableService,
        public readonly acceleratorRepository: AcceleratorRepository,
        public readonly createdAcceleratorMapper: CreatedAcceleratorMapper,
        public readonly acceleratorListItemMapper: AcceleratorListItemMapper,
        public readonly i18n: I18nService,
        @Inject(forwardRef(() => ProfitLossService))
        public readonly profitLossService: ProfitLossService,
    ) {
    }

    public async createAccelerator(createAcceleratorDto: CreateAcceleratorDto): Promise<AcceleratorEntity> {
        return await this.acceleratorRepository.save({
            name: createAcceleratorDto.name,
        });
    }

    public async getAcceleratorById(acceleratorId: number, language: string): Promise<AcceleratorEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const accelerator = await this.acceleratorRepository.findOne(acceleratorId);

        if (!accelerator) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(AcceleratorKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return accelerator;
    }

    async updateAccelerator(
        acceleratorId: number,
        updateAcceleratorDto: UpdateAcceleratorDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const accelerator = await this.acceleratorRepository.findOne(acceleratorId);

        if (!accelerator) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(AcceleratorKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        accelerator.name = updateAcceleratorDto.name;

        const acceleratorUpdated = await this.acceleratorRepository.save(accelerator);
        if (!acceleratorUpdated) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(AcceleratorKeys.UPDATE_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(AcceleratorKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async updateAcceleratorSettings(
        userPayload: UserPayloadDto,
        language: string,
        updateAcceleratorDto: UpdateAcceleratorDto
    ): Promise<BasicOperationsResponse> {

        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithAcceleratorCompanies(userPayload.id);

        if (userEntity && userEntity.accelerator) {
            userEntity.accelerator.name = updateAcceleratorDto.name ?? userEntity.accelerator.name
            userEntity.accelerator.title = updateAcceleratorDto.title ?? userEntity.accelerator.title

            await this.acceleratorRepository.save(userEntity.accelerator)
            return {
                isSuccessful: true,
                message: await this.i18n.translate(AcceleratorKeys.UPDATED_SUCCESSFULLY, {
                    lang: languageCode,
                }),
            };
        } else {
            throw new HttpException(
                {
                    message: await this.i18n.translate(userEntity ? AcceleratorKeys.NOT_FOUND : UserKeys.USER_NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }


    }

    async deleteAccelerator(acceleratorId: number, language: string): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const accelerator = await this.acceleratorRepository.findOne(acceleratorId);

        if (!accelerator) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(AcceleratorKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        await this.acceleratorRepository.delete(acceleratorId);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(AcceleratorKeys.DELETED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    public async getAcceleratorByUserId(userId: number, language: string): Promise<AcceleratorEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const accelerator = await this.acceleratorRepository.findOne({
            relations: ["user"],
            where: { user: { id: userId } },
        });
        if (!accelerator) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(AcceleratorKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return accelerator;
    }

    public async getCompaniesList(
        userPayload: UserPayloadDto,
        language: string
    ): Promise<AcceleratorCompanyListItemDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithAcceleratorCompanies(userPayload.id);

        if (userEntity && userEntity.accelerator && userEntity.accelerator.companies) {
            return userEntity.accelerator.companies.map((company) => ({
                companyId: company.id,
                name: company.name,
                logo: company.logo,
            })).sort((a, b) => a.companyId - b.companyId);
        } else {
            throw new HttpException(
                {
                    message: await this.i18n.translate(userEntity ? AcceleratorKeys.COMPANY_NOT_FOUND : AcceleratorKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

    }

    public async getCompanyById(
        userPayload: UserPayloadDto,
        companyId: number,
        language: string
    ): Promise<AcceleratorCompanyInfoDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithAcceleratorCompanies(userPayload.id);

        if (userEntity && userEntity.accelerator && userEntity.accelerator.companies) {
            const company = userEntity.accelerator.companies.find(item => item.id === companyId);
            if (!company) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(AcceleratorKeys.COMPANY_NOT_FOUND, {
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
                    message: await this.i18n.translate(userEntity ? AcceleratorKeys.COMPANY_NOT_FOUND : AcceleratorKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }
    }

    async getAll(): Promise<AcceleratorListItemDto[]> {
        const accelerators = await this.acceleratorRepository.find();
        return accelerators.map((acceleratorEntity: AcceleratorEntity) =>
            this.acceleratorListItemMapper.transformToDTO(acceleratorEntity),
        );

    }

    public async getAccelerator(
        userPayload: UserPayloadDto,
        language: string
    ): Promise<AcceleratorItemDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithAcceleratorCompanies(userPayload.id);

        if (userEntity && userEntity.accelerator) {
            return userEntity.accelerator;
        } else {
            throw new HttpException(
                {
                    message: await this.i18n.translate(userEntity ? AcceleratorKeys.COMPANY_NOT_FOUND : UserKeys.USER_NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

    }

    public async getCompanyValuationData(
        userPayload: UserPayloadDto,
        companyId: number,
        getValuationDto: GetValuationDto,
        language: string
    ): Promise<ValuationItemListDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithAcceleratorCompanies(userPayload.id);

        if (userEntity && userEntity.accelerator && userEntity.accelerator.companies) {
            const isInPortfolio = userEntity.accelerator.companies.some(
                (company) => company.id === companyId
            );

            if (!isInPortfolio) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(AcceleratorKeys.COMPANY_NOT_FOUND, {
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
                    message: await this.i18n.translate(userEntity ? AcceleratorKeys.COMPANY_NOT_FOUND : AcceleratorKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }
    }

    public async getCompanyCapTableData(
        userPayload: UserPayloadDto,
        companyId: number,
        language: string
    ): Promise<CaptableItemDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithAcceleratorCompanies(userPayload.id);

        if (userEntity && userEntity.accelerator && userEntity.accelerator.companies) {
            const isInPortfolio = userEntity.accelerator.companies.some(
                (company) => company.id === companyId
            );

            if (!isInPortfolio) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(AcceleratorKeys.COMPANY_NOT_FOUND, {
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
                    message: await this.i18n.translate(userEntity ? AcceleratorKeys.COMPANY_NOT_FOUND : AcceleratorKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
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
            console.error(`Can't get accelerator's company organization chart: ${e}`);
            throw e; // Re-throw HttpException
        }
    }

    public async getCompanyActualBudgetItems(
        userPayload: UserPayloadDto,
        companyId: number,
        language: string,
    ): Promise<ActualBudgetItemsListDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userEntity = await this.userService.getUserWithAcceleratorCompanies(userPayload.id);

        if (userEntity && userEntity.accelerator && userEntity.accelerator.companies) {
            const isInPortfolio = userEntity.accelerator.companies.some(
                (company) => company.id === companyId
            );

            if (!isInPortfolio) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(AcceleratorKeys.COMPANY_NOT_FOUND, {
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
                    message: await this.i18n.translate(userEntity ? AcceleratorKeys.COMPANY_NOT_FOUND : AcceleratorKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }
    }
}
