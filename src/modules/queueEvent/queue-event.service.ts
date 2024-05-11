import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { CompanyService } from "../company/services/company.service";
import { FinancialService } from "../financial/services/financial.service";
import { BudgetItemService } from "../budget/budget-item/services/budget-item.service";
import { BudgetItemEntity } from "../budget/budget-item/entities/budget-item.entity";
import { UserPayloadDto } from "../core/user/dto/user-payload.dto";
import { CreateBudgetItemDto } from "../budget/budget-item/dto/request/create_budget_item.dto";
import { CreateFinancialItemDto } from "../financial/dto/request/create_financial_item.dto";
import { BudgetCategory } from "../budget/budget-category/types/budget_category.enum";
import { FinancialDirectCostsCurrentValueCalculation, FinancialDirectCostsFutureGrowth, FinancialDirectCostsItemDto, FinancialDirectCostsManualCurrentValue } from "../financial/dto/request/direct_cost_data.dto";
import { BudgetDirectCostsCurrentValueCalculation, BudgetDirectCostsFutureGrowth, BudgetDirectCostsItemDto, BudgetDirectCostsManualCurrentValue } from "../budget/budget-item/dto/request/direct_cost_data.dto";
import { BudgetRevenueCurrentValueCalculation, BudgetRevenueFutureGrowth, BudgetRevenueItemDto, BudgetRevenueManualCurrentValue, BudgetRevenueManualFutureGrowth } from "../budget/budget-item/dto/request/revenue_data.dto";
import { FinancialRevenueCurrentValueCalculation, FinancialRevenueFutureGrowth, FinancialRevenueItemDto, FinancialRevenueManualCurrentValue, FinancialRevenueManualFutureGrowth } from "../financial/dto/request/revenue_data.dto";
import { BudgetOtherItemsDto } from "../budget/budget-item/dto/request/other_data.dto";
import { FinancialOtherItemsDto } from "../financial/dto/request/other_data.dto";
import { CreateDepartmentDto } from "../department/dto/request/create_department.dto";
import { DepartmentEntity } from "../department/entities/department.entity";
import { EntityManager, TransactionManager } from "typeorm";
import { ItemEntity } from "../company/entities/item.entity";
import { UpdateBudgetItemDto } from "../budget/budget-item/dto/request/update_budget_item.dto";
import { CreateEmployeeDto } from "../employee/dto/request/create_employee.dot";
import { EmployeeEntity } from "../employee/entities/employee.entity";
import { UpdateEmployeeDto } from "../employee/dto/request/update_employee.dot";
import { ProfitLossService } from "../profit_and_loss/services/profit-loss.service";
import { CreateActualBudgetItemDto } from "../profit_and_loss/dto/request/create_actual_budget_item.dto";
import { CreateCompanyPlanDatesDto } from "../company/dto/request/create_company_plan_dates.dto";
import { RevenueModelService } from "../revenue-model/revenue-model.service";
import { CreateRevenueItemDto } from "../revenue-model/dto/request/create_revenue_item.dto";
import { RevenueModelDto } from "../revenue-model/dto/response/revenue_model.dto";
import { CreatedRevenueItemDto } from "../revenue-model/dto/response/created_revenue_item.dto";
import { DepartmentService } from "../department/department.service";
import { CompanyPlanDateEntity } from "../company/entities/company-plan-date.entity";
import { BudgetMonthRepository } from "../budget/budget-item/repositories/budget-month.repository";
import { BudgetMonthRatioRepository } from "../budget/budget-item/repositories/budget-month-ratio.repository";
import { BudgetMonthRatioEntity } from "../budget/budget-item/entities/budget-month-ratio.entity";
import { BudgetMonthEntity } from "../budget/budget-item/entities/budget-month.entity";
import { BudgetItemRevenueFutureGrowthEntity } from "../budget/budget-item/entities/budget-item-revenue-future-growth.entity";
import { BudgetItemRevenueFutureGrowthRepository } from "../budget/budget-item/repositories/budget-item-revenue-future-growth.repository";
import { BudgetItemRevenueEntity } from "../budget/budget-item/entities/budget-item-revenue.entity";
import { RevenueItemEntity } from "../revenue-model/entities/revenue-item.entity";
import { BudgetItemRevenueRepository } from "../budget/budget-item/repositories/budget-item-revenue.repository";
import { BudgetItemDirectCostEntity } from "../budget/budget-item/entities/budget-item-direct-cost.entity";
import { BudgetItemDirectCostRepository } from "../budget/budget-item/repositories/budget-item-direct-cost.repository";
import { BudgetItemManualCostEntity } from "../budget/budget-item/entities/budget-item-manual-cost.entity";
import { BudgetItemManualCostRepository } from "../budget/budget-item/repositories/budget-item-manual-cost.repository";
import { CompanyEntity } from "../company/entities/company.entity";
import { ActualBudgetMonthRatioRepository } from "../profit_and_loss/repositories/actual-budget-month-ratio.repository";
import { ActualBudgetMonthRatioEntity } from "../profit_and_loss/entities/actual-budget-month-ratio.entity";
import { ActualBudgetMonthEntity } from "../profit_and_loss/entities/actual-budget-month.entity";
import { ActualBudgetMonthRepository } from "../profit_and_loss/repositories/actual-budget-month.repository";
import { FinancialQuarterRatioRepository } from "../financial/repositories/financial-quarter-ratio.repository";
import { FinancialQuarterRatioEntity } from "../financial/entities/financial-quarter-ratio.entity";
import { FinancialQuarterEntity } from "../financial/entities/financial-quarter.entity";
import { FinancialQuarterRepository } from "../financial/repositories/financial-quarter.repository";
import { FinancialItemRevenueFutureGrowthEntity } from "../financial/entities/financial-item-revenue-future-growth.entity";
import { FinancialItemRevenueFutureGrowthRepository } from "../financial/repositories/financial-item-revenue-future-growth.repository";
import { FinancialItemRevenueEntity } from "../financial/entities/financial-item-revenue.entity";
import { FinancialItemEntity } from "../financial/entities/financial-item.entity";
import { FinancialItemRevenueRepository } from "../financial/repositories/financial-item-revenue.repository";
import { FinancialItemManualCostEntity } from "../financial/entities/financial-item-manual-cost.entity";
import { FinancialItemManualCostRepository } from "../financial/repositories/financial-item-manual-cost.repository";
import { FinancialItemDirectCostEntity } from "../financial/entities/financial-item-direct-cost.entity";
import { FinancialItemDirectCostRepository } from "../financial/repositories/financial-item-direct-cost.repository";
import { EmployeeRepository } from "../employee/repositories/employee.repository";

@Injectable()
export class QueueEventService {
    constructor(
        @Inject(forwardRef(() => FinancialService))
        public readonly financialService: FinancialService,
        @Inject(forwardRef(() => BudgetItemService))
        public readonly budgetItemService: BudgetItemService,
        @Inject(forwardRef(() => ProfitLossService))
        public readonly profitLossService: ProfitLossService,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        private readonly companyService: CompanyService,
        @Inject(forwardRef(() => RevenueModelService))
        private readonly revenueModelService: RevenueModelService,
        @Inject(forwardRef(() => DepartmentService))
        private readonly departmentService: DepartmentService,
        @Inject(forwardRef(() => EmployeeRepository))
        private readonly employeeRepository: EmployeeRepository,
        @TransactionManager() private transactionManager: EntityManager,
        public readonly budgetMonthRepository: BudgetMonthRepository,
        public readonly budgetMonthRatioRepository: BudgetMonthRatioRepository,
        public readonly budgetItemRevenueFutureGrowthRepository: BudgetItemRevenueFutureGrowthRepository,
        public readonly budgetItemRevenueRepository: BudgetItemRevenueRepository,
        public readonly budgetItemDirectCostRepository: BudgetItemDirectCostRepository,
        public readonly budgetItemManualCostRepository: BudgetItemManualCostRepository,
        public readonly actualBudgetMonthRatioRepository: ActualBudgetMonthRatioRepository,
        public readonly actualBudgetMonthRepository: ActualBudgetMonthRepository,
        public readonly financialQuarterRatioRepository: FinancialQuarterRatioRepository,
        public readonly financialQuarterRepository: FinancialQuarterRepository,
        public readonly financialItemRevenueFutureGrowthRepository: FinancialItemRevenueFutureGrowthRepository,
        public readonly financialItemRevenueRepository: FinancialItemRevenueRepository,
        public readonly financialItemManualCostRepository: FinancialItemManualCostRepository,
        public readonly financialItemDirectCostRepository: FinancialItemDirectCostRepository,
    ) { }

    public async handleBudgetItemCreatedEvent(
        userPayload: UserPayloadDto,
        createBudgetItemDto: CreateBudgetItemDto,
        createdBudgetItemEntity: BudgetItemEntity,
        language: string,
    ): Promise<void> {
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, language);
        const createFinancialItemDto: CreateFinancialItemDto = new CreateFinancialItemDto();

        createFinancialItemDto.name = createBudgetItemDto.name;
        createFinancialItemDto.description = createBudgetItemDto.description;
        createFinancialItemDto.budgetCategoryId = createBudgetItemDto.budgetCategoryId;
        createFinancialItemDto.budgetCategoryType = createBudgetItemDto.budgetCategoryType;

        if (createBudgetItemDto.budgetCategoryType === BudgetCategory.DIRECT_COSTS) {
            const currentData: BudgetDirectCostsItemDto = (createBudgetItemDto.data as BudgetDirectCostsItemDto);
            const data: FinancialDirectCostsItemDto = new FinancialDirectCostsItemDto();

            data.isManualInput = currentData.isManualInput;

            if (currentData.isManualInput) {
                const currentDataFutureGrowth: BudgetDirectCostsFutureGrowth = (currentData.futureGrowth as BudgetDirectCostsFutureGrowth);
                const futureGrowth: FinancialDirectCostsFutureGrowth = new FinancialDirectCostsFutureGrowth();
                futureGrowth.expectedQuarterlyGrowth = currentDataFutureGrowth.expectedMonthlyGrowth;

                const currentDataCurrentValue: BudgetDirectCostsManualCurrentValue = (currentData.currentValue as BudgetDirectCostsManualCurrentValue);
                const currentValue: FinancialDirectCostsManualCurrentValue = new FinancialDirectCostsManualCurrentValue();
                currentValue.amount = currentDataCurrentValue.amount;

                data.currentValue = currentValue;
                data.futureGrowth = futureGrowth;
            } else {
                const currentDataCurrentValue: BudgetDirectCostsCurrentValueCalculation = (currentData.currentValue as BudgetDirectCostsCurrentValueCalculation);
                const currentValue: FinancialDirectCostsCurrentValueCalculation = new FinancialDirectCostsCurrentValueCalculation();
                const item = await this.companyService.getCompanyItemEntityByBudgetItemId(
                    userCompany.id,
                    currentDataCurrentValue.revenueItemId,
                    language,
                );
                if (!item || !item.financialItem) {
                    throw new HttpException({ message: "Couldn't find financial item" }, HttpStatus.NOT_FOUND);
                }
                currentValue.revenueItemId = item.financialItem.id;
                currentValue.revenueItemPercentage = currentDataCurrentValue.revenueItemPercentage;
                currentValue.addOrSubtract = currentDataCurrentValue.addOrSubtract;
                currentValue.amount = currentDataCurrentValue.amount;
                currentValue.willApplyPercentageToUpcomingMonths = currentDataCurrentValue.willApplyPercentageToUpcomingMonths;

                data.currentValue = currentValue;
            }

            createFinancialItemDto.data = data;
        } else if (createBudgetItemDto.budgetCategoryType === BudgetCategory.REVENUE) {
            const currentData: BudgetRevenueItemDto = (createBudgetItemDto.data as BudgetRevenueItemDto);
            const data: FinancialRevenueItemDto = new FinancialRevenueItemDto();

            data.isManualInput = currentData.isManualInput;
            data.applyOnlyMonth = currentData.applyOnlyMonth;

            if (currentData.isManualInput) {
                const currentDataFutureGrowth: BudgetRevenueManualFutureGrowth = (currentData.futureGrowth as BudgetRevenueManualFutureGrowth);
                const futureGrowth: FinancialRevenueManualFutureGrowth = new FinancialRevenueManualFutureGrowth();
                futureGrowth.expectedQuarterlyGrowth = currentDataFutureGrowth.expectedMonthlyGrowth;

                const currentDataCurrentValue: BudgetRevenueManualCurrentValue = (currentData.currentValue as BudgetRevenueManualCurrentValue);
                const currentValue: FinancialRevenueManualCurrentValue = new FinancialRevenueManualCurrentValue();
                currentValue.amount = currentDataCurrentValue.amount;

                data.currentValue = currentValue;
                data.futureGrowth = futureGrowth;
            } else {
                const currentDataCurrentValue: BudgetRevenueCurrentValueCalculation[] = (currentData.currentValue as BudgetRevenueCurrentValueCalculation[]);
                const currentValue: FinancialRevenueCurrentValueCalculation[] = [];

                currentDataCurrentValue.forEach((item) => {
                    currentValue.push({
                        revenueSourceId: item.revenueSourceId,
                        quantity: item.quantity,
                        price: item.price,
                    });
                });

                data.currentValue = currentDataCurrentValue;

                const futureGrowth: FinancialRevenueFutureGrowth = new FinancialRevenueFutureGrowth();
                const currentDataFutureGrowth: BudgetRevenueFutureGrowth = (currentData.futureGrowth as BudgetRevenueFutureGrowth);

                futureGrowth.expectedQuarterlyGrowth = currentDataFutureGrowth.expectedMonthlyGrowth;
                futureGrowth.quarter1Churn = currentDataFutureGrowth.month1ChurnRate;
                futureGrowth.residualChurn = currentDataFutureGrowth.months4To12ChurnRate;

                data.futureGrowth = futureGrowth;
            }

            createFinancialItemDto.data = data;
        } else if (
            createBudgetItemDto.budgetCategoryType === BudgetCategory.OPERATING_EXPENSES ||
            createBudgetItemDto.budgetCategoryType === BudgetCategory.PERSONNEL_COSTS
        ) {
            const currentData: BudgetOtherItemsDto = (createBudgetItemDto.data as BudgetOtherItemsDto);
            const data: FinancialOtherItemsDto = new FinancialOtherItemsDto();

            data.amount = currentData.amount;
            data.expectedQuarterlyGrowth = currentData.expectedMonthlyGrowth;

            createFinancialItemDto.data = data;
        } else {
            throw new HttpException({ message: "Couldn't find budget category type" }, HttpStatus.NOT_FOUND);
        }

        if (!createdBudgetItemEntity.item || !createdBudgetItemEntity.item.id) {
            throw new HttpException({ message: "Couldn't find item." }, HttpStatus.NOT_FOUND);
        }

        await this.financialService.createFinancialItem(userPayload, createFinancialItemDto, createdBudgetItemEntity.item, language);


        // create items for the P&L
        const createActualBudgetItemDto: CreateActualBudgetItemDto = new CreateActualBudgetItemDto();

        createActualBudgetItemDto.name = createBudgetItemDto.name;
        createActualBudgetItemDto.description = createBudgetItemDto.description;
        createActualBudgetItemDto.budgetCategoryId = createBudgetItemDto.budgetCategoryId;
        createActualBudgetItemDto.budgetCategoryType = createBudgetItemDto.budgetCategoryType;

        await this.profitLossService.createActualBudgetItem(userPayload, createActualBudgetItemDto, createdBudgetItemEntity.item, language);
    }

    public async handleBudgetItemDeleteEvent(
        userPayload: UserPayloadDto,
        deletedBudgetItemId: number,
        item: ItemEntity,
        language: string,
    ): Promise<void> {
        if (!item || !item.financialItem) {
            throw new HttpException({ message: "Couldn't find financial item" }, HttpStatus.NOT_FOUND);
        }

        await this.financialService.deleteFinancialItem(userPayload, item.financialItem.id, language);

        if (!item || !item.actualBudgetItem) {
            throw new HttpException({ message: "Couldn't find actual budget item" }, HttpStatus.NOT_FOUND);
        }

        await this.profitLossService.deleteActualBudgetItem(userPayload, item.actualBudgetItem.id, language);

        await this.transactionManager.delete(ItemEntity, item.id);
    }

    public async handleDepartmentCreatedEvent(
        userPayloadDto: UserPayloadDto,
        createDepartmentDto: CreateDepartmentDto,
        createdDepartmentEntity: DepartmentEntity,
        language: string,
    ): Promise<void> {
        const userCompany = await this.companyService.getCompanyByUserId(userPayloadDto.id, language);
        const companyDates = await this.companyService.getCompanyPlanDates(userPayloadDto, language);

        if (companyDates && companyDates.budgetStartDate) {
            const budgetData: BudgetOtherItemsDto = {
                amount: 0,
                expectedMonthlyGrowth: 0,
            };

            const createBudgetItemDto: CreateBudgetItemDto = {
                name: createDepartmentDto.name,
                description: "",
                data: budgetData,
                budgetCategoryId: 0,
                budgetCategoryType: BudgetCategory.PERSONNEL_COSTS,
            };

            const createdBudgetItemDto = await this.budgetItemService.createBudgetItem(userPayloadDto, createBudgetItemDto, language);
            if (createdBudgetItemDto) {
                const item = await this.companyService.getCompanyItemEntityByBudgetItemId(
                    userCompany.id,
                    createdBudgetItemDto.budgetItemId,
                    language,
                );
                if (!item || !item.financialItem) {
                    throw new HttpException({ message: "Couldn't find financial item" }, HttpStatus.NOT_FOUND);
                }
                createdDepartmentEntity.budgetItemId = item.budgetItem.id;
                createdDepartmentEntity.financialItemId = item.financialItem.id;
                await this.transactionManager.save(DepartmentEntity, createdDepartmentEntity);
            }
        }
    }

    public async handleDepartmentDeleteEvent(
        userPayload: UserPayloadDto,
        deletedDepartment: DepartmentEntity,
        language: string,
    ): Promise<void> {
        if (deletedDepartment && deletedDepartment.budgetItem) {
            await this.budgetItemService.deleteBudgetItem(userPayload, deletedDepartment.budgetItem.id, language);
        }
    }

    public async handleDepartmentUpdateNameEvent(
        userPayload: UserPayloadDto,
        updatedDepartment: DepartmentEntity,
        language: string,
    ): Promise<void> {
        if (updatedDepartment && updatedDepartment.name) {
            if (updatedDepartment.budgetItem) {
                const updateBudgetItemDto: UpdateBudgetItemDto = new UpdateBudgetItemDto();
                updateBudgetItemDto.name = updatedDepartment.name;
                updateBudgetItemDto.description = "";
                await this.budgetItemService.updateBudgetItem(userPayload, updatedDepartment.budgetItem.id, updateBudgetItemDto, language);
            }
        }
    }

    public async handleEmployeeCreatedEvent(
        userPayload: UserPayloadDto,
        createEmployeeDto: CreateEmployeeDto,
        createdEmployeeEntity: EmployeeEntity,
        language: string,
    ): Promise<void> {
        if (createdEmployeeEntity) {
            const employee = await this.transactionManager.findOne(EmployeeEntity, createdEmployeeEntity.id, {
                relations: ["department", "department.budgetItem", "department.financialItem"]
            });

            if (employee && employee.department && employee.department.budgetItem) {
                await this.budgetItemService.updatePersonnelCostsBudgetMonthItem(
                    userPayload,
                    employee.department.budgetItem.id,
                    employee.startDate,
                    employee.endDate,
                    createEmployeeDto.yearlySalary * 1.24 / 12,
                    language,
                );
            }

            if (employee && employee.department && employee.department.financialItem) {
                await this.financialService.updatePersonnelCostsFinancialQuarterItem(
                    userPayload,
                    employee.department.financialItem.id,
                    employee.startDate,
                    employee.endDate,
                    (createEmployeeDto.yearlySalary * 1.24) / 12,
                    language,
                );
            }
        }
    }

    public async handleEmployeeUpdatedEvent(
        userPayload: UserPayloadDto,
        oldEmployeeData: EmployeeEntity,
        employeeId: number,
        oldYearlySalary: number,
        oldEmployeeDepartment: number,
        updateEmployeeDto: UpdateEmployeeDto,
        language: string,
    ): Promise<void> {
        const employee = await this.transactionManager.findOne(EmployeeEntity, employeeId, {
            relations: ["department", "department.budgetItem", "department.financialItem"]
        });

        if (employee && employee.department) {
            if (oldEmployeeDepartment !== employee.department.id) { // the department is changed
                const oldDepartment = await this.transactionManager.findOne(DepartmentEntity, oldEmployeeDepartment, {
                    relations: ["budgetItem", "financialItem"]
                });

                if (employee.department.budgetItem) {
                    await this.budgetItemService.updatePersonnelCostsBudgetMonthItem(
                        userPayload,
                        employee.department.budgetItem.id,
                        employee.startDate,
                        employee.endDate,
                        (updateEmployeeDto.yearlySalary * 1.24) / 12,
                        language,
                    );

                    if (oldDepartment && oldDepartment.budgetItem) {
                        await this.budgetItemService.updatePersonnelCostsBudgetMonthItem(
                            userPayload,
                            oldDepartment.budgetItem.id,
                            oldEmployeeData.startDate,
                            oldEmployeeData.endDate,
                            (-1 * oldYearlySalary * 1.24) / 12,
                            language,
                        );
                    }
                }

                if (employee.department.financialItem) {
                    await this.financialService.updatePersonnelCostsFinancialQuarterItem(
                        userPayload,
                        employee.department.financialItem.id,
                        employee.startDate,
                        employee.endDate,
                        (updateEmployeeDto.yearlySalary * 1.24) / 12,
                        language,
                    );

                    if (oldDepartment && oldDepartment.financialItem) {
                        await this.financialService.updatePersonnelCostsFinancialQuarterItem(
                            userPayload,
                            oldDepartment.financialItem.id,
                            oldEmployeeData.startDate,
                            oldEmployeeData.endDate,
                            (-1 * oldYearlySalary * 1.24) / 12,
                            language,
                        );
                    }
                }

            } else {
                const updatedSalary: number = updateEmployeeDto.yearlySalary - oldYearlySalary;
                if (updatedSalary || employee.startDate !== oldEmployeeData.startDate || employee.endDate !== oldEmployeeData.endDate) {
                    if (employee.department.budgetItem) {
                        // remove old salary
                        await this.budgetItemService.updatePersonnelCostsBudgetMonthItem(
                            userPayload,
                            employee.department.budgetItem.id,
                            oldEmployeeData.startDate,
                            oldEmployeeData.endDate,
                            -1 * (oldYearlySalary * 1.24) / 12,
                            language,
                        );

                        // add the new salary
                        await this.budgetItemService.updatePersonnelCostsBudgetMonthItem(
                            userPayload,
                            employee.department.budgetItem.id,
                            employee.startDate,
                            employee.endDate,
                            (updateEmployeeDto.yearlySalary * 1.24) / 12,
                            language,
                        );
                    }

                    if (employee.department.financialItem) {
                        // remove old salary
                        await this.financialService.updatePersonnelCostsFinancialQuarterItem(
                            userPayload,
                            employee.department.financialItem.id,
                            oldEmployeeData.startDate,
                            oldEmployeeData.endDate,
                            -1 * (oldYearlySalary * 1.24) / 12,
                            language,
                        );

                        // add the new salary
                        await this.financialService.updatePersonnelCostsFinancialQuarterItem(
                            userPayload,
                            employee.department.financialItem.id,
                            employee.startDate,
                            employee.endDate,
                            (updateEmployeeDto.yearlySalary * 1.24) / 12,
                            language,
                        );
                    }
                }
            }
        }
    }

    public async handleEmployeeDeletedEvent(
        userPayload: UserPayloadDto,
        deletedEmployee: EmployeeEntity,
        language: string,
    ): Promise<void> {
        if (deletedEmployee.department) {
            if (deletedEmployee.department.budgetItem) {
                await this.budgetItemService.updatePersonnelCostsBudgetMonthItem(
                    userPayload,
                    deletedEmployee.department.budgetItem.id,
                    deletedEmployee.startDate,
                    deletedEmployee.endDate,
                    (deletedEmployee.yearlySalary * 1.24 / 12) * -1,
                    language,
                );
            }

            if (deletedEmployee.department.financialItem) {
                await this.financialService.updatePersonnelCostsFinancialQuarterItem(
                    userPayload,
                    deletedEmployee.department.financialItem.id,
                    deletedEmployee.startDate,
                    deletedEmployee.endDate,
                    ((deletedEmployee.yearlySalary * 1.24) / 12) * -1,
                    language,
                );
            }
        }
    }

    public async handleCompanyPlanDatesCreatedEvent(
        userPayload: UserPayloadDto,
        createPlanDatesDto: CreateCompanyPlanDatesDto,
        language: string,
    ): Promise<void> {
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, language);

        // create three revenue model items
        const createRevenueItemDto: CreateRevenueItemDto = new CreateRevenueItemDto();
        createRevenueItemDto.items = [];

        const revenueModelList: RevenueModelDto[] = await this.revenueModelService.getRevenueModelOptionsList();
        if (revenueModelList && revenueModelList.length > 0) {
            revenueModelList.forEach(revenue => {
                if (revenue.name !== 'Other') {
                    createRevenueItemDto.items.push({
                        name: revenue.name,
                        description: "The description for the revenue model.",
                        initialPrice: 100,
                        revenueModelId: revenue.id,
                    });
                }
            });

            const createdRevenueItemDtoList: CreatedRevenueItemDto[] = await this.revenueModelService.createRevenueItem(userPayload, createRevenueItemDto, language);

            if (createdRevenueItemDtoList && createdRevenueItemDtoList.length > 0) {

                for (let i = 0; i < createdRevenueItemDtoList.length; i++) {
                    const item = createdRevenueItemDtoList[i];
                    const createBudgetItemDto: CreateBudgetItemDto = new CreateBudgetItemDto();
                    createBudgetItemDto.budgetCategoryId = 0;
                    createBudgetItemDto.budgetCategoryType = BudgetCategory.REVENUE;
                    createBudgetItemDto.name = `Revenue Line ${i + 1}`;
                    createBudgetItemDto.description = "";

                    const data: BudgetRevenueItemDto = new BudgetRevenueItemDto();
                    data.isManualInput = false;
                    data.currentValue = [];
                    data.currentValue.push({
                        revenueSourceId: item.revenueItemId,
                        quantity: 0,
                        price: 0,
                    });
                    const futureGrowth = new BudgetRevenueFutureGrowth();
                    futureGrowth.expectedMonthlyGrowth = 0;
                    futureGrowth.month1ChurnRate = 0;
                    futureGrowth.month2ChurnRate = 0;
                    futureGrowth.month3ChurnRate = 0;
                    futureGrowth.months4To12ChurnRate = 0;

                    data.futureGrowth = futureGrowth;

                    createBudgetItemDto.data = data;
                    await this.budgetItemService.createBudgetItem(userPayload, createBudgetItemDto, language);
                }
            }
        }
        // create direct cost items
        for (let i = 1; i <= 3; i++) {
            const createBudgetItemDto: CreateBudgetItemDto = new CreateBudgetItemDto();
            createBudgetItemDto.budgetCategoryId = 0;
            createBudgetItemDto.budgetCategoryType = BudgetCategory.DIRECT_COSTS;
            createBudgetItemDto.name = `Direct Cost ${i}`;
            createBudgetItemDto.description = "";

            const data: BudgetDirectCostsItemDto = new BudgetDirectCostsItemDto();
            data.isManualInput = true;
            data.currentValue = new BudgetDirectCostsManualCurrentValue();
            data.currentValue.amount = 0;
            data.futureGrowth = new BudgetDirectCostsFutureGrowth();
            data.futureGrowth.expectedMonthlyGrowth = 0;

            createBudgetItemDto.data = data;
            await this.budgetItemService.createBudgetItem(userPayload, createBudgetItemDto, language);
        }

        // create OPERATING_EXPENSES items
        for (let i = 1; i <= 3; i++) {
            const createBudgetItemDto: CreateBudgetItemDto = new CreateBudgetItemDto();
            createBudgetItemDto.budgetCategoryId = 0;
            createBudgetItemDto.budgetCategoryType = BudgetCategory.OPERATING_EXPENSES;
            createBudgetItemDto.name = `Operating Expenses ${i}`;
            createBudgetItemDto.description = "";

            const data: BudgetOtherItemsDto = new BudgetOtherItemsDto();
            data.amount = 0;
            data.expectedMonthlyGrowth = 0;

            createBudgetItemDto.data = data;
            await this.budgetItemService.createBudgetItem(userPayload, createBudgetItemDto, language);
        }

        // create PERSONNEL_COSTS
        for (let i = 1; i <= 3; i++) {
            const createDepartmentDto: CreateDepartmentDto = new CreateDepartmentDto();
            createDepartmentDto.name = `Department ${i}`;
            createDepartmentDto.description = "";

            await this.departmentService.createDepartment(userPayload, createDepartmentDto, language);
        }
    }

    public async handleCompanyPlanDatesUpdatedEvent(
        userPayload: UserPayloadDto,
        oldCompanyPlanDate: CompanyPlanDateEntity,
        newCompanyPlanDate: CompanyPlanDateEntity,
        language: string,
    ): Promise<void> {
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, language);
        const oldMonthsNum = this.monthsBetweenDates(oldCompanyPlanDate.budgetStartDate, oldCompanyPlanDate.budgetEndDate);
        const newMonthsNum = this.monthsBetweenDates(newCompanyPlanDate.budgetStartDate, newCompanyPlanDate.budgetEndDate);

        // update budget dates
        await this.handleBudgetChangeDate(
            oldCompanyPlanDate,
            newCompanyPlanDate,
            oldMonthsNum,
            newMonthsNum,
            userCompany,
        );

        // update P&L dates
        await this.handleProfitAndLossChangeDate(
            oldCompanyPlanDate,
            newCompanyPlanDate,
            oldMonthsNum,
            newMonthsNum,
            userCompany,
        );

        // update financial dates
        await this.handleFinancialChangeDate(
            oldCompanyPlanDate,
            newCompanyPlanDate,
            userCompany,
        );
    }

    private async handleBudgetChangeDate(
        oldCompanyPlanDate: CompanyPlanDateEntity,
        newCompanyPlanDate: CompanyPlanDateEntity,
        oldMonthsNum: number,
        newMonthsNum: number,
        userCompany: CompanyEntity,
    ): Promise<void> {
        let relations: string[] = [];
        if (newMonthsNum > oldMonthsNum) {
            relations = [
                "company",
                "budgetMonths",
                "budgetMonths.budgetItem",

                "budgetMonths.budgetItemRevenues",
                "budgetMonths.budgetItemRevenues.parentBudgetItemRevenue",
                "budgetMonths.budgetItemRevenues.budgetItemRevenueFutureGrowth",
                "budgetMonths.budgetItemRevenues.revenueItem",
                "budgetMonths.budgetItemRevenues.budgetItem",

                "budgetMonths.budgetItemDirectCosts",
                "budgetMonths.budgetItemDirectCosts.budgetItem",
                "budgetMonths.budgetItemDirectCosts.percentageFromBudgetMonth",
                "budgetMonths.budgetItemDirectCosts.percentageFromBudgetMonth.budgetItem",


                "budgetMonths.budgetItemDirectCostDependencies",
                "budgetMonths.budgetItemDirectCostDependencies.budgetItem",
                "budgetMonths.budgetItemDirectCostDependencies.percentageFromBudgetMonth",

                "budgetMonths.budgetItemManualCosts",
                "budgetMonths.budgetItemManualCosts.parentBudgetItemManualCost",
                "budgetMonths.budgetItemManualCosts.budgetItem",
            ];
        } else {
            relations = [
                "company",
                "budgetMonths",
                "budgetMonths.budgetItem",

                "budgetMonths.budgetItemManualCosts",
                "budgetMonths.budgetItemManualCosts.parentBudgetItemManualCost",
                "budgetMonths.budgetItemManualCosts.budgetItem",
            ];
        }
        const budgetMonthRatios = await this.budgetMonthRatioRepository.find({
            where: {
                company: userCompany,
            },
            relations: relations,
            order: {
                monthDate: "ASC",
            },
        });

        budgetMonthRatios.forEach((obj) => {
            // sort by the category and budget item id
            if (obj && obj.budgetMonths) {
                const getBudgetCategoryValue = (budgetCategory: BudgetCategory) => {
                    if (budgetCategory === BudgetCategory.REVENUE) return 0;
                    if (budgetCategory === BudgetCategory.DIRECT_COSTS) return 1;
                    if (budgetCategory === BudgetCategory.PERSONNEL_COSTS) return 2;
                    return 3;
                };
                obj.budgetMonths.sort((a, b) => {
                    return getBudgetCategoryValue(a.categoryType) - getBudgetCategoryValue(b.categoryType) || a.budgetItem.id - b.budgetItem.id
                });
            }
        });

        const currentBudgetDate = new Date(newCompanyPlanDate.budgetStartDate);

        const budgetMonthRatiosIdsToRemove: number[] = [];
        const budgetMonthRatiosToUpdate: BudgetMonthRatioEntity[] = [];
        const budgetMonthsToUpdate: BudgetMonthEntity[] = [];
        const budgetItemManualCostToUpdate: BudgetItemManualCostEntity[] = [];

        for (let i = 1; i <= Math.max(newMonthsNum, oldMonthsNum); i++) {
            if (i > newMonthsNum) { // remove months
                budgetMonthRatiosIdsToRemove.push(budgetMonthRatios[i - 1].id);
            } else if (i > oldMonthsNum) { // add months
                // create BudgetMonthRatioEntity
                // create Budget Month Ratios Entities
                let newBudgetStartDate = new Date(currentBudgetDate);
                let newBudgetEndDate = new Date(newCompanyPlanDate.budgetEndDate);
                let monthNumber = i;
                const listToSave: BudgetMonthRatioEntity[] = [];
                while (newBudgetStartDate <= newBudgetEndDate) {
                    const budgetMonthRatioEntity = new BudgetMonthRatioEntity();
                    budgetMonthRatioEntity.monthDate = new Date(newBudgetStartDate);
                    budgetMonthRatioEntity.company = userCompany;
                    budgetMonthRatioEntity.monthNumber = monthNumber;

                    listToSave.push(budgetMonthRatioEntity);

                    newBudgetStartDate.setMonth(newBudgetStartDate.getMonth() + 1);
                    monthNumber += 1;
                }

                const revenueBudgetMonthMap: Record<number, BudgetMonthEntity[]> = {};
                const createdBudgetRatiosList = await this.budgetMonthRatioRepository.save(listToSave);
                // create budget Months
                for (let itemNumber = 0; itemNumber < budgetMonthRatios[i - 2].budgetMonths.length; itemNumber++) {
                    const lastBudgetMonth: BudgetMonthEntity = budgetMonthRatios[i - 2].budgetMonths[itemNumber];
                    const newStartDate = new Date(currentBudgetDate);
                    const newEndDate = new Date(newCompanyPlanDate.budgetEndDate);
                    let order = i;
                    monthNumber = i;
                    let index = 0;
                    const monthsList: BudgetMonthEntity[] = [];
                    while (newStartDate <= newEndDate) {
                        const budgetMonthEntity = new BudgetMonthEntity();
                        budgetMonthEntity.displayOrder = order;
                        budgetMonthEntity.budgetItem = lastBudgetMonth.budgetItem;
                        budgetMonthEntity.value = 0;
                        budgetMonthEntity.monthNumber = monthNumber;
                        budgetMonthEntity.monthDate = new Date(newStartDate);
                        budgetMonthEntity.categoryType = lastBudgetMonth.categoryType;
                        budgetMonthEntity.budgetMonthRatio = createdBudgetRatiosList[index];
                        monthsList.push(budgetMonthEntity);
                        order += 1;
                        monthNumber += 1;
                        newStartDate.setMonth(newStartDate.getMonth() + 1);
                        index += 1;
                    }
                    const createdMonthsList = await this.budgetMonthRepository.save(monthsList);

                    // The Revenue items.
                    if (lastBudgetMonth.categoryType === BudgetCategory.REVENUE) {
                        const isManualInput = lastBudgetMonth.budgetItemManualCosts && lastBudgetMonth.budgetItemManualCosts.length > 0;

                        if (isManualInput) {
                            const listToSave: BudgetItemManualCostEntity[] = [];
                            let currentAmount = lastBudgetMonth.budgetItemManualCosts[0].amount;
                            const expectedMonthlyGrowth = lastBudgetMonth.budgetItemManualCosts[0].monthlyGrowth;

                            for (let createdMonthNum = 0; createdMonthNum < createdMonthsList.length; createdMonthNum++) {
                                const budgetItemManualCostEntity = new BudgetItemManualCostEntity();
                                currentAmount = currentAmount + currentAmount * (expectedMonthlyGrowth / 100.0);
                                budgetItemManualCostEntity.amount = currentAmount;
                                budgetItemManualCostEntity.oldAddedValue = currentAmount;
                                budgetItemManualCostEntity.monthlyGrowth = expectedMonthlyGrowth;
                                budgetItemManualCostEntity.budgetMonth = createdMonthsList[createdMonthNum];
                                budgetItemManualCostEntity.budgetItem = new BudgetItemEntity();
                                budgetItemManualCostEntity.budgetItem.id = lastBudgetMonth.budgetItemManualCosts[0].budgetItem.id;

                                if (lastBudgetMonth.budgetItemManualCosts[0].parentBudgetItemManualCost) {
                                    budgetItemManualCostEntity.parentBudgetItemManualCost = lastBudgetMonth.budgetItemManualCosts[0].parentBudgetItemManualCost;
                                    budgetItemManualCostEntity.parentBudgetItemManualCostId = lastBudgetMonth.budgetItemManualCosts[0].parentBudgetItemManualCost.id;
                                } else {
                                    budgetItemManualCostEntity.parentBudgetItemManualCost = lastBudgetMonth.budgetItemManualCosts[0];
                                    budgetItemManualCostEntity.parentBudgetItemManualCostId = lastBudgetMonth.budgetItemManualCosts[0].id;
                                }

                                // update month's value
                                createdMonthsList[createdMonthNum].value = budgetItemManualCostEntity.amount;
                                createdMonthsList[createdMonthNum].oldValue = createdMonthsList[createdMonthNum].value;
                                createdBudgetRatiosList[createdMonthNum].totalDirectCosts += budgetItemManualCostEntity.amount;

                                listToSave.push(budgetItemManualCostEntity);
                            }

                            await this.budgetItemManualCostRepository.save(listToSave);

                            // update months
                            await this.budgetMonthRepository.save(createdMonthsList);

                        } else {

                            revenueBudgetMonthMap[lastBudgetMonth.budgetItem.id] = createdMonthsList;
                            const futureGrowthListToSave: BudgetItemRevenueFutureGrowthEntity[] = [];
                            for (let j = 0; j < createdMonthsList.length; j++) {
                                // create futureGrowth
                                const entity = new BudgetItemRevenueFutureGrowthEntity();
                                entity.monthlyGrowth = lastBudgetMonth.budgetItemRevenues[0].budgetItemRevenueFutureGrowth.monthlyGrowth;
                                entity.month1Churn = lastBudgetMonth.budgetItemRevenues[0].budgetItemRevenueFutureGrowth.month1Churn;
                                entity.month2Churn = lastBudgetMonth.budgetItemRevenues[0].budgetItemRevenueFutureGrowth.month2Churn;
                                entity.month3Churn = lastBudgetMonth.budgetItemRevenues[0].budgetItemRevenueFutureGrowth.month3Churn;
                                entity.months4To12ChurnRate = lastBudgetMonth.budgetItemRevenues[0].budgetItemRevenueFutureGrowth.months4To12ChurnRate;

                                futureGrowthListToSave.push(entity);
                            }

                            const createdFutureGrowthList = await this.budgetItemRevenueFutureGrowthRepository.save(
                                futureGrowthListToSave,
                            );
                            const listToSave: BudgetItemRevenueEntity[] = [];
                            for (let createdMonthNum = 0; createdMonthNum < createdMonthsList.length; createdMonthNum++) {
                                let currentMonthValue = 0;
                                let minParentIndex = 0;
                                for (let k = 0; k < 4; k++) {
                                    minParentIndex = i - 2 - k;
                                    if (!budgetMonthRatios[i - 2 - k].budgetMonths[itemNumber].budgetItemRevenues[0].parentBudgetItemRevenue) {
                                        break;
                                    }
                                }

                                for (let j = 0; j < lastBudgetMonth.budgetItemRevenues.length; j++) {
                                    let onePrevMonth: BudgetItemRevenueEntity = null;
                                    let twoPrevMonth: BudgetItemRevenueEntity = null;
                                    let threePrevMonth: BudgetItemRevenueEntity = null;
                                    const length = lastBudgetMonth.budgetItemRevenues.length;

                                    if (createdMonthNum === 0) { // 0 
                                        onePrevMonth = lastBudgetMonth.budgetItemRevenues[j];
                                    } else {
                                        onePrevMonth = listToSave[(createdMonthNum - 1) * length + j];
                                    }

                                    if (createdMonthNum <= 1) { // 0 or 1
                                        if ((i - 3 + createdMonthNum) >= minParentIndex) {
                                            twoPrevMonth = budgetMonthRatios[i - 3 + createdMonthNum].budgetMonths[itemNumber].budgetItemRevenues[j];
                                        }
                                    } else {
                                        twoPrevMonth = listToSave[(createdMonthNum - 2) * length + j];
                                    }

                                    if (createdMonthNum <= 2) { // 0 or 1 or 2
                                        if ((i - 4 + createdMonthNum) >= minParentIndex) {
                                            threePrevMonth = budgetMonthRatios[i - 4 + createdMonthNum].budgetMonths[itemNumber].budgetItemRevenues[j];
                                        }
                                    } else {
                                        threePrevMonth = listToSave[(createdMonthNum - 3) * length + j];
                                    }

                                    let existingQuantityAtStartOfMonth = onePrevMonth.quantity;
                                    let newMonthlyQuantities = (onePrevMonth.quantity * (createdFutureGrowthList[createdMonthNum].monthlyGrowth / 100.0));
                                    let quantityLeaveMonthOne = (newMonthlyQuantities * (createdFutureGrowthList[createdMonthNum].month1Churn / 100.0));
                                    let quantityLeaveMonthTwo = (onePrevMonth.newMonthlyQuantities * (createdFutureGrowthList[createdMonthNum].month2Churn / 100.0));
                                    let quantityLeaveMonthThree = 0;
                                    if (twoPrevMonth) {
                                        quantityLeaveMonthThree = (twoPrevMonth.newMonthlyQuantities * (createdFutureGrowthList[createdMonthNum].month3Churn / 100.0));
                                    }
                                    let residualChurnedQuantities = 0;
                                    if (threePrevMonth) {
                                        residualChurnedQuantities = (threePrevMonth.quantity * (createdFutureGrowthList[createdMonthNum].months4To12ChurnRate / 100.0));
                                    }

                                    const entity = new BudgetItemRevenueEntity();
                                    entity.budgetItem = new BudgetItemEntity();
                                    entity.budgetItem.id = lastBudgetMonth.budgetItemRevenues[j].budgetItem.id;

                                    entity.existingQuantityAtStartOfMonth = existingQuantityAtStartOfMonth;
                                    entity.newMonthlyQuantities = newMonthlyQuantities;
                                    entity.quantityLeaveMonthOne = quantityLeaveMonthOne;
                                    entity.quantityLeaveMonthTwo = quantityLeaveMonthTwo;
                                    entity.quantityLeaveMonthThree = quantityLeaveMonthThree;
                                    entity.residualChurnedQuantities = residualChurnedQuantities;

                                    entity.quantity =
                                        entity.existingQuantityAtStartOfMonth +
                                        entity.newMonthlyQuantities -
                                        entity.quantityLeaveMonthOne -
                                        entity.quantityLeaveMonthTwo -
                                        entity.quantityLeaveMonthThree -
                                        entity.residualChurnedQuantities;

                                    entity.price = lastBudgetMonth.budgetItemRevenues[j].price;
                                    entity.oldAddedValue = Number((entity.price * entity.quantity).toFixed(2));

                                    const revenueItem = new RevenueItemEntity();
                                    revenueItem.id = lastBudgetMonth.budgetItemRevenues[j].revenueItem.id;
                                    entity.revenueItem = revenueItem;

                                    entity.budgetItemRevenueFutureGrowth = createdFutureGrowthList[createdMonthNum];
                                    entity.budgetMonth = createdMonthsList[createdMonthNum];

                                    if (lastBudgetMonth.budgetItemRevenues[j].parentBudgetItemRevenue) {
                                        entity.parentBudgetItemRevenue = lastBudgetMonth.budgetItemRevenues[j].parentBudgetItemRevenue;
                                        entity.parentBudgetItemRevenueId = lastBudgetMonth.budgetItemRevenues[j].parentBudgetItemRevenue.id;
                                    } else {
                                        entity.parentBudgetItemRevenue = lastBudgetMonth.budgetItemRevenues[j];
                                        entity.parentBudgetItemRevenueId = lastBudgetMonth.budgetItemRevenues[j].id;
                                    }


                                    currentMonthValue += entity.oldAddedValue;

                                    listToSave.push(entity);
                                }

                                createdMonthsList[createdMonthNum].value = currentMonthValue;
                                createdMonthsList[createdMonthNum].oldValue = createdMonthsList[createdMonthNum].value;
                                createdBudgetRatiosList[createdMonthNum].grossIncome += currentMonthValue;
                            }

                            await this.budgetItemRevenueRepository.save(listToSave);

                            // update months
                            await this.budgetMonthRepository.save(createdMonthsList);
                        }

                    } else if (lastBudgetMonth.categoryType === BudgetCategory.DIRECT_COSTS) {
                        const isManualInput = lastBudgetMonth.budgetItemManualCosts && lastBudgetMonth.budgetItemManualCosts.length > 0;
                        if (isManualInput) {
                            const listToSave: BudgetItemManualCostEntity[] = [];
                            let currentAmount = lastBudgetMonth.budgetItemManualCosts[0].amount;
                            const expectedMonthlyGrowth = lastBudgetMonth.budgetItemManualCosts[0].monthlyGrowth;

                            for (let createdMonthNum = 0; createdMonthNum < createdMonthsList.length; createdMonthNum++) {
                                const budgetItemManualCostEntity = new BudgetItemManualCostEntity();
                                currentAmount = currentAmount + currentAmount * (expectedMonthlyGrowth / 100.0);
                                budgetItemManualCostEntity.amount = currentAmount;
                                budgetItemManualCostEntity.oldAddedValue = currentAmount;
                                budgetItemManualCostEntity.monthlyGrowth = expectedMonthlyGrowth;
                                budgetItemManualCostEntity.budgetMonth = createdMonthsList[createdMonthNum];
                                budgetItemManualCostEntity.budgetItem = new BudgetItemEntity();
                                budgetItemManualCostEntity.budgetItem.id = lastBudgetMonth.budgetItemManualCosts[0].budgetItem.id;

                                if (lastBudgetMonth.budgetItemManualCosts[0].parentBudgetItemManualCost) {
                                    budgetItemManualCostEntity.parentBudgetItemManualCost = lastBudgetMonth.budgetItemManualCosts[0].parentBudgetItemManualCost;
                                    budgetItemManualCostEntity.parentBudgetItemManualCostId = lastBudgetMonth.budgetItemManualCosts[0].parentBudgetItemManualCost.id;
                                } else {
                                    budgetItemManualCostEntity.parentBudgetItemManualCost = lastBudgetMonth.budgetItemManualCosts[0];
                                    budgetItemManualCostEntity.parentBudgetItemManualCostId = lastBudgetMonth.budgetItemManualCosts[0].id;
                                }

                                // update month's value
                                createdMonthsList[createdMonthNum].value = budgetItemManualCostEntity.amount;
                                createdMonthsList[createdMonthNum].oldValue = createdMonthsList[createdMonthNum].value;
                                createdBudgetRatiosList[createdMonthNum].totalDirectCosts += budgetItemManualCostEntity.amount;

                                listToSave.push(budgetItemManualCostEntity);
                            }

                            await this.budgetItemManualCostRepository.save(listToSave);

                            // update months
                            await this.budgetMonthRepository.save(createdMonthsList);

                        } else {
                            const listToSave: BudgetItemDirectCostEntity[] = [];
                            const percentageFromBudgetItemId = lastBudgetMonth.budgetItemDirectCosts[0].percentageFromBudgetMonth.budgetItem.id;
                            for (let createdMonthNum = 0; createdMonthNum < createdMonthsList.length; createdMonthNum++) {
                                const entity = new BudgetItemDirectCostEntity();
                                entity.percentage = lastBudgetMonth.budgetItemDirectCosts[0].percentage;
                                entity.amount = lastBudgetMonth.budgetItemDirectCosts[0].amount;
                                entity.budgetMonth = createdMonthsList[createdMonthNum];
                                entity.budgetItem = new BudgetItemEntity();
                                entity.budgetItem.id = lastBudgetMonth.budgetItemDirectCosts[0].budgetItem.id;

                                entity.percentageFromBudgetMonth = revenueBudgetMonthMap[percentageFromBudgetItemId][createdMonthNum];
                                entity.oldAddedValue =
                                    entity.percentageFromBudgetMonth.value * (entity.percentage / 100.0) + entity.amount;

                                createdMonthsList[createdMonthNum].value = entity.oldAddedValue;
                                createdMonthsList[createdMonthNum].oldValue = createdMonthsList[createdMonthNum].value;
                                createdBudgetRatiosList[createdMonthNum].totalDirectCosts += entity.oldAddedValue;

                                listToSave.push(entity);
                            }

                            await this.budgetItemDirectCostRepository.save(listToSave);

                            // update months
                            await this.budgetMonthRepository.save(createdMonthsList);

                        }
                    } else if (
                        lastBudgetMonth.categoryType === BudgetCategory.OPERATING_EXPENSES ||
                        lastBudgetMonth.categoryType === BudgetCategory.PERSONNEL_COSTS
                    ) {
                        const listToSave: BudgetItemManualCostEntity[] = [];
                        let currentAmount = lastBudgetMonth.budgetItemManualCosts[0].amount;
                        let expectedMonthlyGrowth = lastBudgetMonth.budgetItemManualCosts[0].monthlyGrowth;
                        const isPersonnelCosts = lastBudgetMonth.categoryType === BudgetCategory.PERSONNEL_COSTS;

                        for (let createdMonthNum = 0; createdMonthNum < createdMonthsList.length; createdMonthNum++) {
                            const budgetItemManualCostEntity = new BudgetItemManualCostEntity();
                            if (isPersonnelCosts) {
                                currentAmount = await this.sumMonthlyCostsByBudgetItemId(lastBudgetMonth.budgetItem.id, createdMonthsList[createdMonthNum].monthDate);
                                expectedMonthlyGrowth = 0;
                            } else {
                                currentAmount = currentAmount + currentAmount * (expectedMonthlyGrowth / 100.0);
                            }
                            budgetItemManualCostEntity.amount = currentAmount;
                            budgetItemManualCostEntity.oldAddedValue = currentAmount;
                            budgetItemManualCostEntity.monthlyGrowth = expectedMonthlyGrowth;
                            budgetItemManualCostEntity.budgetMonth = createdMonthsList[createdMonthNum];
                            budgetItemManualCostEntity.budgetItem = new BudgetItemEntity();
                            budgetItemManualCostEntity.budgetItem.id = lastBudgetMonth.budgetItemManualCosts[0].budgetItem.id;

                            if (lastBudgetMonth.budgetItemManualCosts[0].parentBudgetItemManualCost) {
                                budgetItemManualCostEntity.parentBudgetItemManualCost = lastBudgetMonth.budgetItemManualCosts[0].parentBudgetItemManualCost;
                                budgetItemManualCostEntity.parentBudgetItemManualCostId = lastBudgetMonth.budgetItemManualCosts[0].parentBudgetItemManualCost.id;
                            } else {
                                budgetItemManualCostEntity.parentBudgetItemManualCost = lastBudgetMonth.budgetItemManualCosts[0];
                                budgetItemManualCostEntity.parentBudgetItemManualCostId = lastBudgetMonth.budgetItemManualCosts[0].id;
                            }

                            // update month's value
                            createdMonthsList[createdMonthNum].value = budgetItemManualCostEntity.amount;
                            createdMonthsList[createdMonthNum].oldValue = createdMonthsList[createdMonthNum].value;

                            if (lastBudgetMonth.categoryType === BudgetCategory.OPERATING_EXPENSES) {
                                createdBudgetRatiosList[createdMonthNum].totalOperatingExpenses += budgetItemManualCostEntity.amount;
                            } else {
                                createdBudgetRatiosList[createdMonthNum].totalPersonnelCosts += budgetItemManualCostEntity.amount;
                            }

                            listToSave.push(budgetItemManualCostEntity);
                        }

                        await this.budgetItemManualCostRepository.save(listToSave);

                        // update months
                        await this.budgetMonthRepository.save(createdMonthsList);

                    } else {
                        throw new HttpException({ message: "Couldn't find budget category type" }, HttpStatus.NOT_FOUND);
                    }
                }

                // update ratio value
                for (const budgetMonthRatio of createdBudgetRatiosList) {
                    budgetMonthRatio.grossMargin = budgetMonthRatio.grossIncome - budgetMonthRatio.totalDirectCosts;
                    budgetMonthRatio.grossMarginPercentage =
                        100.0 *
                        (budgetMonthRatio.grossIncome === 0 ? 0 : budgetMonthRatio.grossMargin / budgetMonthRatio.grossIncome);

                    budgetMonthRatio.ebitda =
                        budgetMonthRatio.grossMargin -
                        budgetMonthRatio.totalPersonnelCosts -
                        budgetMonthRatio.totalOperatingExpenses;
                    budgetMonthRatio.ebitdaPercentage =
                        100.0 *
                        (budgetMonthRatio.grossIncome === 0 ? 0 : budgetMonthRatio.ebitda / budgetMonthRatio.grossIncome);
                }

                // update month Ratios
                await this.budgetMonthRatioRepository.save(createdBudgetRatiosList);

                break;
            } else { // update months date
                const updatedBudgetMonthRatio: BudgetMonthRatioEntity = new BudgetMonthRatioEntity();
                updatedBudgetMonthRatio.id = budgetMonthRatios[i - 1].id;
                updatedBudgetMonthRatio.monthDate = new Date(currentBudgetDate);
                budgetMonthRatiosToUpdate.push(updatedBudgetMonthRatio);

                if (budgetMonthRatios[i - 1].budgetMonths) {
                    for (const budgetMonth of budgetMonthRatios[i - 1].budgetMonths) {
                        const updatedBudgetMonth: BudgetMonthEntity = new BudgetMonthEntity();
                        updatedBudgetMonth.id = budgetMonth.id;
                        updatedBudgetMonth.monthDate = new Date(currentBudgetDate);


                        if (budgetMonth.categoryType === BudgetCategory.PERSONNEL_COSTS
                            && budgetMonth.budgetItemManualCosts && budgetMonth.budgetItemManualCosts.length > 0) {

                            const newAmount = await this.sumMonthlyCostsByBudgetItemId(budgetMonth.budgetItem.id, currentBudgetDate);

                            const budgetItemManualCostEntity = new BudgetItemManualCostEntity();
                            budgetItemManualCostEntity.id = budgetMonth.budgetItemManualCosts[0].id;
                            budgetItemManualCostEntity.amount = newAmount;
                            budgetItemManualCostEntity.oldAddedValue = newAmount;
                            budgetItemManualCostEntity.monthlyGrowth = 0;

                            updatedBudgetMonthRatio.totalPersonnelCosts += (newAmount - budgetMonth.oldValue);

                            updatedBudgetMonth.value = newAmount;
                            updatedBudgetMonth.oldValue = newAmount;

                            // update ratio values
                            updatedBudgetMonthRatio.ebitda =
                                updatedBudgetMonthRatio.grossMargin -
                                updatedBudgetMonthRatio.totalPersonnelCosts -
                                updatedBudgetMonthRatio.totalOperatingExpenses;
                            updatedBudgetMonthRatio.ebitdaPercentage =
                                100.0 *
                                (updatedBudgetMonthRatio.grossIncome === 0 ? 0 : updatedBudgetMonthRatio.ebitda / updatedBudgetMonthRatio.grossIncome);


                            budgetItemManualCostToUpdate.push(budgetItemManualCostEntity);
                        }

                        budgetMonthsToUpdate.push(updatedBudgetMonth);
                    }
                }
            }
            currentBudgetDate.setMonth(currentBudgetDate.getMonth() + 1);
        }

        if (budgetMonthRatiosIdsToRemove.length > 0) {
            await this.budgetMonthRatioRepository.delete(budgetMonthRatiosIdsToRemove);
        }

        if (budgetMonthRatiosToUpdate.length > 0) {
            await this.budgetMonthRatioRepository.save(budgetMonthRatiosToUpdate);
        }

        if (budgetMonthsToUpdate.length > 0) {
            await this.budgetMonthRepository.save(budgetMonthsToUpdate);
        }

        if (budgetItemManualCostToUpdate.length > 0) {
            await this.budgetItemManualCostRepository.save(budgetItemManualCostToUpdate);
        }
    }

    monthsBetweenDates(startDate: Date, endDate: Date): number {
        const start = new Date(startDate);
        const end = new Date(endDate);

        let months = (end.getFullYear() - start.getFullYear()) * 12;
        months -= start.getMonth();
        months += end.getMonth();
        months += 1;

        return months;
    }

    private async sumMonthlyCostsByBudgetItemId(budgetItemId: number, monthDate: Date): Promise<number> {
        const sumResult = await this.employeeRepository
            .createQueryBuilder('employee')
            .innerJoin('employee.department', 'department') // Use INNER JOIN if every employee must have a department
            .where('department.budgetItemId = :budgetItemId', { budgetItemId })
            .andWhere(
                '(DATE_TRUNC(\'month\', CAST(employee.startDate AS TIMESTAMP)) <= DATE_TRUNC(\'month\', CAST(:monthDate AS TIMESTAMP)) AND ' +
                '(employee.endDate IS NULL OR DATE_TRUNC(\'month\', CAST(employee.endDate AS TIMESTAMP)) >= DATE_TRUNC(\'month\', CAST(:monthDate AS TIMESTAMP))))',
                {
                    monthDate,
                }
            )
            .select('SUM(employee.monthlyCost)', 'totalMonthlyCost')
            .getRawOne();
        return sumResult.totalMonthlyCost || 0;
    }

    private async handleFinancialChangeDate(
        oldCompanyPlanDate: CompanyPlanDateEntity,
        newCompanyPlanDate: CompanyPlanDateEntity,
        userCompany: CompanyEntity,
    ): Promise<void> {
        const quarterRatios = await this.financialQuarterRatioRepository.find({
            where: {
                company: userCompany,
            },
            relations: [
                "company",
                "financialQuarters",
                "financialQuarters.financialItem",

                "financialQuarters.financialItemManualCosts",
                "financialQuarters.financialItemManualCosts.parentFinancialItemManualCost",
                "financialQuarters.financialItemManualCosts.financialItem",
            ],
            order: {
                quarterDate: "ASC",
            },
        });

        quarterRatios.forEach((obj) => {
            // sort by the category and actual budget item id
            if (obj && obj.financialQuarters) {
                const getBudgetCategoryValue = (budgetCategory: BudgetCategory) => {
                    if (budgetCategory === BudgetCategory.REVENUE) return 0;
                    if (budgetCategory === BudgetCategory.DIRECT_COSTS) return 1;
                    if (budgetCategory === BudgetCategory.PERSONNEL_COSTS) return 2;
                    return 3;
                };
                obj.financialQuarters.sort((a, b) => {
                    return getBudgetCategoryValue(a.categoryType) - getBudgetCategoryValue(b.categoryType) || a.financialItem.id - b.financialItem.id
                });
            }
        });

        const currentFinancialDate = new Date(newCompanyPlanDate.financialStartDate);

        const financialQuarterRatioToUpdate: FinancialQuarterRatioEntity[] = [];
        const financialQuartersToUpdate: FinancialQuarterEntity[] = [];
        const financialItemManualCostToUpdate: FinancialItemManualCostEntity[] = [];

        let index = 0;
        while (currentFinancialDate <= newCompanyPlanDate.financialEndDate) {
            const updatedFinancialQuarterRatio: FinancialQuarterRatioEntity = new FinancialQuarterRatioEntity();
            updatedFinancialQuarterRatio.id = quarterRatios[index].id;
            updatedFinancialQuarterRatio.quarterDate = new Date(currentFinancialDate);
            financialQuarterRatioToUpdate.push(updatedFinancialQuarterRatio);

            if (quarterRatios[index].financialQuarters) {
                for (const financialQuarter of quarterRatios[index].financialQuarters) {
                    const updatedFinancialQuarter: FinancialQuarterEntity = new FinancialQuarterEntity();
                    updatedFinancialQuarter.id = financialQuarter.id;
                    updatedFinancialQuarter.quarterDate = new Date(currentFinancialDate);

                    if (financialQuarter.categoryType === BudgetCategory.PERSONNEL_COSTS
                        && financialQuarter.financialItemManualCosts && financialQuarter.financialItemManualCosts.length > 0) {

                        let newAmount = await this.sumQuarterlyCostsByFinancialItemId(financialQuarter.financialItem.id, currentFinancialDate);

                        const financialItemManualCostEntity = new FinancialItemManualCostEntity();
                        financialItemManualCostEntity.id = financialQuarter.financialItemManualCosts[0].id;
                        financialItemManualCostEntity.amount = newAmount;
                        financialItemManualCostEntity.oldAddedValue = newAmount;

                        updatedFinancialQuarterRatio.totalPersonnelCosts += (newAmount - financialQuarter.oldValue);

                        updatedFinancialQuarter.value = newAmount;
                        updatedFinancialQuarter.oldValue = newAmount;

                        // update ratio values
                        updatedFinancialQuarterRatio.ebitda =
                            updatedFinancialQuarterRatio.grossMargin -
                            updatedFinancialQuarterRatio.totalPersonnelCosts -
                            updatedFinancialQuarterRatio.totalOperatingExpenses;
                        updatedFinancialQuarterRatio.ebitdaPercentage =
                            100.0 *
                            (updatedFinancialQuarterRatio.grossIncome === 0 ? 0 : updatedFinancialQuarterRatio.ebitda / updatedFinancialQuarterRatio.grossIncome);


                        financialItemManualCostToUpdate.push(financialItemManualCostEntity);
                    }


                    financialQuartersToUpdate.push(updatedFinancialQuarter);
                }
            }

            index += 1;
            currentFinancialDate.setMonth(currentFinancialDate.getMonth() + 3);
        }

        if (financialQuarterRatioToUpdate.length > 0) {
            await this.financialQuarterRatioRepository.save(financialQuarterRatioToUpdate);
        }

        if (financialQuartersToUpdate.length > 0) {
            await this.financialQuarterRepository.save(financialQuartersToUpdate);
        }

        if (financialItemManualCostToUpdate.length > 0) {
            await this.financialItemManualCostRepository.save(financialItemManualCostToUpdate);
        }
    }


    private async handleProfitAndLossChangeDate(
        oldCompanyPlanDate: CompanyPlanDateEntity,
        newCompanyPlanDate: CompanyPlanDateEntity,
        oldMonthsNum: number,
        newMonthsNum: number,
        userCompany: CompanyEntity,
    ): Promise<void> {
        const actualBudgetMonthRatios = await this.actualBudgetMonthRatioRepository.find({
            where: {
                company: userCompany,
            },
            order: {
                monthDate: "ASC",
            },
            relations: ["company", "actualBudgetMonths", "actualBudgetMonths.actualBudgetItem"],
        });

        actualBudgetMonthRatios.forEach((obj) => {
            // sort by the category and actual budget item id
            if (obj && obj.actualBudgetMonths) {
                const getBudgetCategoryValue = (budgetCategory: BudgetCategory) => {
                    if (budgetCategory === BudgetCategory.REVENUE) return 0;
                    if (budgetCategory === BudgetCategory.DIRECT_COSTS) return 1;
                    if (budgetCategory === BudgetCategory.PERSONNEL_COSTS) return 2;
                    return 3;
                };
                obj.actualBudgetMonths.sort((a, b) => {
                    return getBudgetCategoryValue(a.categoryType) - getBudgetCategoryValue(b.categoryType) || a.actualBudgetItem.id - b.actualBudgetItem.id
                });
            }
        });

        const currentBudgetDate = new Date(newCompanyPlanDate.budgetStartDate);

        const actualBudgetMonthRatiosIdsToRemove: number[] = [];
        const actualBudgetMonthRatiosToUpdate: ActualBudgetMonthRatioEntity[] = [];
        const actualBudgetMonthsToUpdate: ActualBudgetMonthEntity[] = [];

        for (let i = 1; i <= Math.max(newMonthsNum, oldMonthsNum); i++) {
            if (i > newMonthsNum) { // remove months
                actualBudgetMonthRatiosIdsToRemove.push(actualBudgetMonthRatios[i - 1].id);
            } else if (i > oldMonthsNum) { // add months
                // create ActualBudgetMonthRatioEntity
                // create Actual Budget Month Ratios Entities
                let newBudgetStartDate = new Date(currentBudgetDate);
                let newBudgetEndDate = new Date(newCompanyPlanDate.budgetEndDate);
                let monthNumber = i;
                const listToSave: ActualBudgetMonthRatioEntity[] = [];
                while (newBudgetStartDate <= newBudgetEndDate) {
                    const actualBudgetMonthRatioEntity = new ActualBudgetMonthRatioEntity();
                    actualBudgetMonthRatioEntity.monthDate = new Date(newBudgetStartDate);
                    actualBudgetMonthRatioEntity.company = userCompany;
                    actualBudgetMonthRatioEntity.monthNumber = monthNumber;

                    listToSave.push(actualBudgetMonthRatioEntity);

                    newBudgetStartDate.setMonth(newBudgetStartDate.getMonth() + 1);
                    monthNumber += 1;
                }

                const createdActualBudgetRatiosList = await this.actualBudgetMonthRatioRepository.save(listToSave);
                // create actual budget Months
                for (let itemNumber = 0; itemNumber < actualBudgetMonthRatios[i - 2].actualBudgetMonths.length; itemNumber++) {
                    const lastBudgetMonth: ActualBudgetMonthEntity = actualBudgetMonthRatios[i - 2].actualBudgetMonths[itemNumber];
                    const newStartDate = new Date(currentBudgetDate);
                    const newEndDate = new Date(newCompanyPlanDate.budgetEndDate);
                    let order = i;
                    monthNumber = i;
                    let index = 0;
                    const monthsList: ActualBudgetMonthEntity[] = [];
                    while (newStartDate <= newEndDate) {
                        const actualBudgetMonthEntity = new ActualBudgetMonthEntity();
                        actualBudgetMonthEntity.displayOrder = order;
                        actualBudgetMonthEntity.actualBudgetItem = lastBudgetMonth.actualBudgetItem;
                        actualBudgetMonthEntity.value = 0;
                        actualBudgetMonthEntity.monthNumber = monthNumber;
                        actualBudgetMonthEntity.monthDate = new Date(newStartDate);
                        actualBudgetMonthEntity.categoryType = lastBudgetMonth.categoryType;
                        actualBudgetMonthEntity.actualBudgetMonthRatio = createdActualBudgetRatiosList[index];
                        monthsList.push(actualBudgetMonthEntity);
                        order += 1;
                        monthNumber += 1;
                        newStartDate.setMonth(newStartDate.getMonth() + 1);
                        index += 1;
                    }
                    await this.actualBudgetMonthRepository.save(monthsList);
                }
                break;
            } else { // update months date
                const updatedBudgetMonthRatio: ActualBudgetMonthRatioEntity = new ActualBudgetMonthRatioEntity();
                updatedBudgetMonthRatio.id = actualBudgetMonthRatios[i - 1].id;
                updatedBudgetMonthRatio.monthDate = new Date(currentBudgetDate);
                actualBudgetMonthRatiosToUpdate.push(updatedBudgetMonthRatio);

                if (actualBudgetMonthRatios[i - 1].actualBudgetMonths) {
                    actualBudgetMonthRatios[i - 1].actualBudgetMonths.forEach(m => {
                        const updatedBudgetMonth: ActualBudgetMonthEntity = new ActualBudgetMonthEntity();
                        updatedBudgetMonth.id = m.id;
                        updatedBudgetMonth.monthDate = new Date(currentBudgetDate);
                        actualBudgetMonthsToUpdate.push(updatedBudgetMonth);
                    });
                }
            }
            currentBudgetDate.setMonth(currentBudgetDate.getMonth() + 1);
        }

        if (actualBudgetMonthRatiosIdsToRemove.length > 0) {
            await this.actualBudgetMonthRatioRepository.delete(actualBudgetMonthRatiosIdsToRemove);
        }

        if (actualBudgetMonthRatiosToUpdate.length > 0) {
            await this.actualBudgetMonthRatioRepository.save(actualBudgetMonthRatiosToUpdate);
        }

        if (actualBudgetMonthsToUpdate.length > 0) {
            await this.actualBudgetMonthRepository.save(actualBudgetMonthsToUpdate);
        }
    }


    public async handleCompanyFinancialYearsUpdatedEvent(
        userPayload: UserPayloadDto,
        oldCompanyPlanDate: CompanyPlanDateEntity,
        newCompanyPlanDate: CompanyPlanDateEntity,
        oldNumberYears: number,
        newNumberYears: number,
        language: string,
    ): Promise<void> {
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, language);

        // update financial dates
        let relations: string[] = [];
        if (newNumberYears > oldNumberYears) {
            relations = [
                "company",
                "financialQuarters",
                "financialQuarters.financialItem",

                "financialQuarters.financialItemRevenues",
                "financialQuarters.financialItemRevenues.parentFinancialItemRevenue",
                "financialQuarters.financialItemRevenues.financialItemRevenueFutureGrowth",
                "financialQuarters.financialItemRevenues.revenueItem",
                "financialQuarters.financialItemRevenues.financialItem",

                "financialQuarters.financialItemDirectCosts",
                "financialQuarters.financialItemDirectCosts.financialItem",
                "financialQuarters.financialItemDirectCosts.percentageFromFinancialQuarter",
                "financialQuarters.financialItemDirectCosts.percentageFromFinancialQuarter.financialItem",

                "financialQuarters.financialItemDirectCostDependencies",
                "financialQuarters.financialItemDirectCostDependencies.financialItem",
                "financialQuarters.financialItemDirectCostDependencies.percentageFromFinancialQuarter",

                "financialQuarters.financialItemManualCosts",
                "financialQuarters.financialItemManualCosts.parentFinancialItemManualCost",
                "financialQuarters.financialItemManualCosts.financialItem",
            ];
        } else {
            relations = [
                "company",
                "financialQuarters",
                "financialQuarters.financialItem",

                "financialQuarters.financialItemManualCosts",
                "financialQuarters.financialItemManualCosts.parentFinancialItemManualCost",
                "financialQuarters.financialItemManualCosts.financialItem",
            ];
        }
        const quarterRatios = await this.financialQuarterRatioRepository.find({
            where: {
                company: userCompany,
            },
            relations: relations,
            order: {
                quarterDate: "ASC",
            },
        });

        quarterRatios.forEach((obj) => {
            // sort by the category and financial item id
            if (obj && obj.financialQuarters) {
                const getBudgetCategoryValue = (budgetCategory: BudgetCategory) => {
                    if (budgetCategory === BudgetCategory.REVENUE) return 0;
                    if (budgetCategory === BudgetCategory.DIRECT_COSTS) return 1;
                    if (budgetCategory === BudgetCategory.PERSONNEL_COSTS) return 2;
                    return 3;
                };
                obj.financialQuarters.sort((a, b) => {
                    return getBudgetCategoryValue(a.categoryType) - getBudgetCategoryValue(b.categoryType) || a.financialItem.id - b.financialItem.id
                });
            }
        });

        const currentFinancialDate = new Date(newCompanyPlanDate.financialStartDate);

        const financialQuarterRatiosIdsToRemove: number[] = [];

        const oldNumberQuarters = (oldNumberYears - 1) * 4;
        const newNumberQuarters = (newNumberYears - 1) * 4;
        for (let i = 1; i <= Math.max(oldNumberQuarters, newNumberQuarters); i++) {
            if (i > newNumberQuarters) { // remove quarters
                financialQuarterRatiosIdsToRemove.push(quarterRatios[i - 1].id);
            } else if (i > oldNumberQuarters) { // add quarters
                // create FinancialQuarterRatioEntity
                // create Financial Quarter Ratio Entities
                let newFinancialStartDate = new Date(currentFinancialDate);
                let newFinancialEndDate = new Date(newCompanyPlanDate.financialEndDate);
                let quarterNumber = i;
                if (quarterNumber >= 5) {
                    quarterNumber = 1;
                }
                const listToSave: FinancialQuarterRatioEntity[] = [];
                while (newFinancialStartDate <= newFinancialEndDate) {
                    const financialQuarterRatioEntity = new FinancialQuarterRatioEntity();
                    financialQuarterRatioEntity.quarterDate = new Date(newFinancialStartDate);
                    financialQuarterRatioEntity.company = userCompany;
                    financialQuarterRatioEntity.quarterNumber = quarterNumber;

                    listToSave.push(financialQuarterRatioEntity);

                    newFinancialStartDate.setMonth(newFinancialStartDate.getMonth() + 3);

                    quarterNumber += 1;
                    if (quarterNumber >= 5) {
                        quarterNumber = 1;
                    }
                }

                const revenueFinancialQuarterMap: Record<number, FinancialQuarterEntity[]> = {};
                const createdFinancialRatiosList = await this.financialQuarterRatioRepository.save(listToSave);
                // create Financial Quarters
                for (let itemNumber = 0; itemNumber < quarterRatios[i - 2].financialQuarters.length; itemNumber++) {
                    const lastFinancialQuarter: FinancialQuarterEntity = quarterRatios[i - 2].financialQuarters[itemNumber];
                    const newStartDate = new Date(currentFinancialDate);
                    const newEndDate = new Date(newCompanyPlanDate.financialEndDate);
                    let order = i;
                    quarterNumber = i;
                    if (quarterNumber >= 5) {
                        quarterNumber = 1;
                    }
                    let index = 0;
                    const quartersList: FinancialQuarterEntity[] = [];
                    while (newStartDate <= newEndDate) {
                        const financialQuarterEntity = new FinancialQuarterEntity();
                        financialQuarterEntity.displayOrder = order;
                        financialQuarterEntity.financialItem = lastFinancialQuarter.financialItem;
                        financialQuarterEntity.value = 0;
                        financialQuarterEntity.quarterNumber = quarterNumber;
                        financialQuarterEntity.quarterDate = new Date(newStartDate);
                        financialQuarterEntity.categoryType = lastFinancialQuarter.categoryType;
                        financialQuarterEntity.financialQuarterRatio = createdFinancialRatiosList[index];
                        quartersList.push(financialQuarterEntity);
                        order += 1;
                        quarterNumber += 1;
                        if (quarterNumber >= 5) {
                            quarterNumber = 1;
                        }
                        newStartDate.setMonth(newStartDate.getMonth() + 3);
                        index += 1;
                    }
                    const createdQuartersList = await this.financialQuarterRepository.save(quartersList);

                    // The Revenue items.
                    if (lastFinancialQuarter.categoryType === BudgetCategory.REVENUE) {
                        const isManualInput = lastFinancialQuarter.financialItemManualCosts && lastFinancialQuarter.financialItemManualCosts.length > 0;
                        if (isManualInput) {
                            const listToSave: FinancialItemManualCostEntity[] = [];
                            let currentAmount = lastFinancialQuarter.financialItemManualCosts[0].amount;
                            const expectedQuarterlyGrowth = lastFinancialQuarter.financialItemManualCosts[0].quarterlyGrowth;

                            for (let createdQuarterNum = 0; createdQuarterNum < createdQuartersList.length; createdQuarterNum++) {
                                const financialItemManualCostEntity = new FinancialItemManualCostEntity();
                                currentAmount = currentAmount + currentAmount * (expectedQuarterlyGrowth / 100.0);
                                financialItemManualCostEntity.amount = currentAmount;
                                financialItemManualCostEntity.oldAddedValue = currentAmount;
                                financialItemManualCostEntity.quarterlyGrowth = expectedQuarterlyGrowth;
                                financialItemManualCostEntity.financialQuarter = createdQuartersList[createdQuarterNum];
                                financialItemManualCostEntity.financialItem = new FinancialItemEntity();
                                financialItemManualCostEntity.financialItem.id = lastFinancialQuarter.financialItemManualCosts[0].financialItem.id;

                                if (lastFinancialQuarter.financialItemManualCosts[0].parentFinancialItemManualCost) {
                                    financialItemManualCostEntity.parentFinancialItemManualCost = lastFinancialQuarter.financialItemManualCosts[0].parentFinancialItemManualCost;
                                    financialItemManualCostEntity.parentFinancialItemManualCostId = lastFinancialQuarter.financialItemManualCosts[0].parentFinancialItemManualCost.id;
                                } else {
                                    financialItemManualCostEntity.parentFinancialItemManualCost = lastFinancialQuarter.financialItemManualCosts[0];
                                    financialItemManualCostEntity.parentFinancialItemManualCostId = lastFinancialQuarter.financialItemManualCosts[0].id;
                                }

                                // update quarter's value
                                createdQuartersList[createdQuarterNum].value = financialItemManualCostEntity.amount;
                                createdQuartersList[createdQuarterNum].oldValue = createdQuartersList[createdQuarterNum].value;
                                createdFinancialRatiosList[createdQuarterNum].totalDirectCosts += financialItemManualCostEntity.amount;

                                listToSave.push(financialItemManualCostEntity);
                            }

                            await this.financialItemManualCostRepository.save(listToSave);

                            // update quarters
                            await this.financialQuarterRepository.save(createdQuartersList);

                        } else {
                            revenueFinancialQuarterMap[lastFinancialQuarter.financialItem.id] = createdQuartersList;
                            const futureGrowthListToSave: FinancialItemRevenueFutureGrowthEntity[] = [];
                            for (let j = 0; j < createdQuartersList.length; j++) {
                                // create futureGrowth
                                const entity = new FinancialItemRevenueFutureGrowthEntity();
                                entity.quarterlyGrowth = lastFinancialQuarter.financialItemRevenues[0].financialItemRevenueFutureGrowth.quarterlyGrowth;
                                entity.quarter1Churn = lastFinancialQuarter.financialItemRevenues[0].financialItemRevenueFutureGrowth.quarter1Churn;
                                entity.residualChurn = lastFinancialQuarter.financialItemRevenues[0].financialItemRevenueFutureGrowth.residualChurn;

                                futureGrowthListToSave.push(entity);
                            }

                            const createdFutureGrowthList = await this.financialItemRevenueFutureGrowthRepository.save(
                                futureGrowthListToSave,
                            );

                            const listToSave: FinancialItemRevenueEntity[] = [];
                            for (let createdQuarterNum = 0; createdQuarterNum < createdQuartersList.length; createdQuarterNum++) {
                                let currentQuarterValue = 0;

                                for (let j = 0; j < lastFinancialQuarter.financialItemRevenues.length; j++) {
                                    let onePrevQuarter: FinancialItemRevenueEntity = null;
                                    const length = lastFinancialQuarter.financialItemRevenues.length;

                                    if (createdQuarterNum === 0) { // 0 
                                        onePrevQuarter = lastFinancialQuarter.financialItemRevenues[j];
                                    } else {
                                        onePrevQuarter = listToSave[(createdQuarterNum - 1) * length + j];
                                    }

                                    let existingQuantityAtStartOfQuarter = onePrevQuarter.quantity;
                                    let newQuarterlyQuantities = (onePrevQuarter.quantity * (createdFutureGrowthList[createdQuarterNum].quarterlyGrowth / 100.0));
                                    let quantityLeaveQuarterOne = (newQuarterlyQuantities * (createdFutureGrowthList[createdQuarterNum].quarter1Churn / 100.0));
                                    let residualChurnedQuantities = (onePrevQuarter.quantity * (createdFutureGrowthList[createdQuarterNum].residualChurn / 100.0));

                                    const entity = new FinancialItemRevenueEntity();
                                    entity.financialItem = new FinancialItemEntity();
                                    entity.financialItem.id = lastFinancialQuarter.financialItemRevenues[j].financialItem.id;

                                    entity.existingQuantityAtStartOfQuarter = existingQuantityAtStartOfQuarter;
                                    entity.newQuarterlyQuantities = newQuarterlyQuantities;
                                    entity.quantityLeaveQuarterOne = quantityLeaveQuarterOne;
                                    entity.residualChurnedQuantities = residualChurnedQuantities;

                                    entity.quantity =
                                        entity.existingQuantityAtStartOfQuarter +
                                        entity.newQuarterlyQuantities -
                                        entity.quantityLeaveQuarterOne -
                                        entity.residualChurnedQuantities;

                                    entity.price = lastFinancialQuarter.financialItemRevenues[j].price;
                                    entity.oldAddedValue = Number((entity.price * entity.quantity).toFixed(2));

                                    const revenueItem = new RevenueItemEntity();
                                    revenueItem.id = lastFinancialQuarter.financialItemRevenues[j].revenueItem.id;
                                    entity.revenueItem = revenueItem;

                                    entity.financialItemRevenueFutureGrowth = createdFutureGrowthList[createdQuarterNum];
                                    entity.financialQuarter = createdQuartersList[createdQuarterNum];

                                    if (lastFinancialQuarter.financialItemRevenues[j].parentFinancialItemRevenue) {
                                        entity.parentFinancialItemRevenue = lastFinancialQuarter.financialItemRevenues[j].parentFinancialItemRevenue;
                                        entity.parentFinancialItemRevenueId = lastFinancialQuarter.financialItemRevenues[j].parentFinancialItemRevenue.id;
                                    } else {
                                        entity.parentFinancialItemRevenue = lastFinancialQuarter.financialItemRevenues[j];
                                        entity.parentFinancialItemRevenueId = lastFinancialQuarter.financialItemRevenues[j].id;
                                    }


                                    currentQuarterValue += entity.oldAddedValue;

                                    listToSave.push(entity);
                                }

                                createdQuartersList[createdQuarterNum].value = currentQuarterValue;
                                createdQuartersList[createdQuarterNum].oldValue = createdQuartersList[createdQuarterNum].value;
                                createdFinancialRatiosList[createdQuarterNum].grossIncome += currentQuarterValue;
                            }

                            await this.financialItemRevenueRepository.save(listToSave);

                            // update quarters
                            await this.financialQuarterRepository.save(createdQuartersList);
                        }
                    } else if (lastFinancialQuarter.categoryType === BudgetCategory.DIRECT_COSTS) {
                        const isManualInput = lastFinancialQuarter.financialItemManualCosts && lastFinancialQuarter.financialItemManualCosts.length > 0;
                        if (isManualInput) {
                            const listToSave: FinancialItemManualCostEntity[] = [];
                            let currentAmount = lastFinancialQuarter.financialItemManualCosts[0].amount;
                            const expectedQuarterlyGrowth = lastFinancialQuarter.financialItemManualCosts[0].quarterlyGrowth;

                            for (let createdQuarterNum = 0; createdQuarterNum < createdQuartersList.length; createdQuarterNum++) {
                                const financialItemManualCostEntity = new FinancialItemManualCostEntity();
                                currentAmount = currentAmount + currentAmount * (expectedQuarterlyGrowth / 100.0);
                                financialItemManualCostEntity.amount = currentAmount;
                                financialItemManualCostEntity.oldAddedValue = currentAmount;
                                financialItemManualCostEntity.quarterlyGrowth = expectedQuarterlyGrowth;
                                financialItemManualCostEntity.financialQuarter = createdQuartersList[createdQuarterNum];
                                financialItemManualCostEntity.financialItem = new FinancialItemEntity();
                                financialItemManualCostEntity.financialItem.id = lastFinancialQuarter.financialItemManualCosts[0].financialItem.id;

                                if (lastFinancialQuarter.financialItemManualCosts[0].parentFinancialItemManualCost) {
                                    financialItemManualCostEntity.parentFinancialItemManualCost = lastFinancialQuarter.financialItemManualCosts[0].parentFinancialItemManualCost;
                                    financialItemManualCostEntity.parentFinancialItemManualCostId = lastFinancialQuarter.financialItemManualCosts[0].parentFinancialItemManualCost.id;
                                } else {
                                    financialItemManualCostEntity.parentFinancialItemManualCost = lastFinancialQuarter.financialItemManualCosts[0];
                                    financialItemManualCostEntity.parentFinancialItemManualCostId = lastFinancialQuarter.financialItemManualCosts[0].id;
                                }

                                // update quarter's value
                                createdQuartersList[createdQuarterNum].value = financialItemManualCostEntity.amount;
                                createdQuartersList[createdQuarterNum].oldValue = createdQuartersList[createdQuarterNum].value;
                                createdFinancialRatiosList[createdQuarterNum].totalDirectCosts += financialItemManualCostEntity.amount;

                                listToSave.push(financialItemManualCostEntity);
                            }

                            await this.financialItemManualCostRepository.save(listToSave);

                            // update quarters
                            await this.financialQuarterRepository.save(createdQuartersList);

                        } else {
                            const listToSave: FinancialItemDirectCostEntity[] = [];
                            const percentageFromFinancialItemId = lastFinancialQuarter.financialItemDirectCosts[0].percentageFromFinancialQuarter.financialItem.id;
                            for (let createdQuarterNum = 0; createdQuarterNum < createdQuartersList.length; createdQuarterNum++) {
                                const entity = new FinancialItemDirectCostEntity();
                                entity.percentage = lastFinancialQuarter.financialItemDirectCosts[0].percentage;
                                entity.amount = lastFinancialQuarter.financialItemDirectCosts[0].amount;
                                entity.financialQuarter = createdQuartersList[createdQuarterNum];
                                entity.financialItem = new FinancialItemEntity();
                                entity.financialItem.id = lastFinancialQuarter.financialItemDirectCosts[0].financialItem.id;

                                entity.percentageFromFinancialQuarter = revenueFinancialQuarterMap[percentageFromFinancialItemId][createdQuarterNum];
                                entity.oldAddedValue =
                                    entity.percentageFromFinancialQuarter.value * (entity.percentage / 100.0) + entity.amount;

                                createdQuartersList[createdQuarterNum].value = entity.oldAddedValue;
                                createdQuartersList[createdQuarterNum].oldValue = createdQuartersList[createdQuarterNum].value;
                                createdFinancialRatiosList[createdQuarterNum].totalDirectCosts += entity.oldAddedValue;

                                listToSave.push(entity);
                            }

                            await this.financialItemDirectCostRepository.save(listToSave);

                            // update quarters
                            await this.financialQuarterRepository.save(createdQuartersList);

                        }
                    } else if (
                        lastFinancialQuarter.categoryType === BudgetCategory.OPERATING_EXPENSES ||
                        lastFinancialQuarter.categoryType === BudgetCategory.PERSONNEL_COSTS
                    ) {
                        const listToSave: FinancialItemManualCostEntity[] = [];
                        let currentAmount = lastFinancialQuarter.financialItemManualCosts[0].amount;
                        const expectedQuarterlyGrowth = lastFinancialQuarter.financialItemManualCosts[0].quarterlyGrowth;
                        const isPersonnelCosts = lastFinancialQuarter.categoryType === BudgetCategory.PERSONNEL_COSTS;

                        for (let createdQuarterNum = 0; createdQuarterNum < createdQuartersList.length; createdQuarterNum++) {
                            const financialItemManualCostEntity = new FinancialItemManualCostEntity();
                            if (isPersonnelCosts) {
                                currentAmount = await this.sumQuarterlyCostsByFinancialItemId(lastFinancialQuarter.financialItem.id, createdQuartersList[createdQuarterNum].quarterDate);
                            } else {
                                currentAmount = currentAmount + currentAmount * (expectedQuarterlyGrowth / 100.0);
                            }
                            financialItemManualCostEntity.amount = currentAmount;
                            financialItemManualCostEntity.oldAddedValue = currentAmount;
                            financialItemManualCostEntity.quarterlyGrowth = expectedQuarterlyGrowth;
                            financialItemManualCostEntity.financialQuarter = createdQuartersList[createdQuarterNum];
                            financialItemManualCostEntity.financialItem = new FinancialItemEntity();
                            financialItemManualCostEntity.financialItem.id = lastFinancialQuarter.financialItemManualCosts[0].financialItem.id;

                            if (lastFinancialQuarter.financialItemManualCosts[0].parentFinancialItemManualCost) {
                                financialItemManualCostEntity.parentFinancialItemManualCost = lastFinancialQuarter.financialItemManualCosts[0].parentFinancialItemManualCost;
                                financialItemManualCostEntity.parentFinancialItemManualCostId = lastFinancialQuarter.financialItemManualCosts[0].parentFinancialItemManualCost.id;
                            } else {
                                financialItemManualCostEntity.parentFinancialItemManualCost = lastFinancialQuarter.financialItemManualCosts[0];
                                financialItemManualCostEntity.parentFinancialItemManualCostId = lastFinancialQuarter.financialItemManualCosts[0].id;
                            }

                            // update quarter's value
                            createdQuartersList[createdQuarterNum].value = financialItemManualCostEntity.amount;
                            createdQuartersList[createdQuarterNum].oldValue = createdQuartersList[createdQuarterNum].value;

                            if (lastFinancialQuarter.categoryType === BudgetCategory.OPERATING_EXPENSES) {
                                createdFinancialRatiosList[createdQuarterNum].totalOperatingExpenses += financialItemManualCostEntity.amount;
                            } else {
                                createdFinancialRatiosList[createdQuarterNum].totalPersonnelCosts += financialItemManualCostEntity.amount;
                            }

                            listToSave.push(financialItemManualCostEntity);
                        }

                        await this.financialItemManualCostRepository.save(listToSave);

                        // update quarters
                        await this.financialQuarterRepository.save(createdQuartersList);

                    } else {
                        throw new HttpException({ message: "Couldn't find budget category type" }, HttpStatus.NOT_FOUND);
                    }
                }

                // update ratio value
                for (const financialQuarterRatio of createdFinancialRatiosList) {
                    financialQuarterRatio.grossMargin = financialQuarterRatio.grossIncome - financialQuarterRatio.totalDirectCosts;
                    financialQuarterRatio.grossMarginPercentage =
                        100.0 *
                        (financialQuarterRatio.grossIncome === 0 ? 0 : financialQuarterRatio.grossMargin / financialQuarterRatio.grossIncome);

                    financialQuarterRatio.ebitda =
                        financialQuarterRatio.grossMargin -
                        financialQuarterRatio.totalPersonnelCosts -
                        financialQuarterRatio.totalOperatingExpenses;
                    financialQuarterRatio.ebitdaPercentage =
                        100.0 *
                        (financialQuarterRatio.grossIncome === 0 ? 0 : financialQuarterRatio.ebitda / financialQuarterRatio.grossIncome);
                }

                // update quarter Ratios
                await this.financialQuarterRatioRepository.save(createdFinancialRatiosList);

                break;
            } else { // ignore the update quarters date
            }
            currentFinancialDate.setMonth(currentFinancialDate.getMonth() + 3);
        }

        if (financialQuarterRatiosIdsToRemove.length > 0) {
            await this.financialQuarterRatioRepository.delete(financialQuarterRatiosIdsToRemove);
        }
    }

    private async sumQuarterlyCostsByFinancialItemId(financialItemId: number, quarterDate: Date): Promise<number> {
        const monthDates = Array.from({ length: 3 }, (_, i) => {
            const date = new Date(quarterDate);
            date.setMonth(quarterDate.getMonth() - i);
            return date;
        });

        const monthlyCostPromises = monthDates.map((date) =>
            this.sumMonthlyCostsByFinancialItemId(financialItemId, date)
        );

        const monthlyCosts = await Promise.all(monthlyCostPromises);

        return monthlyCosts.reduce((total, cost) => total + cost, 0);
    }


    private async sumMonthlyCostsByFinancialItemId(financialItemId: number, monthDate: Date): Promise<number> {
        const sumResult = await this.employeeRepository
            .createQueryBuilder('employee')
            .innerJoin('employee.department', 'department') // Use INNER JOIN if every employee must have a department
            .where('department.financialItemId = :financialItemId', { financialItemId })
            .andWhere(
                '(DATE_TRUNC(\'month\', CAST(employee.startDate AS TIMESTAMP)) <= DATE_TRUNC(\'month\', CAST(:monthDate AS TIMESTAMP)) AND ' +
                '(employee.endDate IS NULL OR DATE_TRUNC(\'month\', CAST(employee.endDate AS TIMESTAMP)) >= DATE_TRUNC(\'month\', CAST(:monthDate AS TIMESTAMP))))',
                {
                    monthDate,
                }
            )
            .select('SUM(employee.monthlyCost)', 'totalMonthlyCost')
            .getRawOne();
        return sumResult.totalMonthlyCost || 0;
    }
}