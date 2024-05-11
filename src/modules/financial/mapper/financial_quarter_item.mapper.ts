import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { FinancialQuarterItemDto } from "../dto/response/financial_quarter_item.dto";
import { FinancialQuarterEntity } from "../entities/financial-quarter.entity";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { FinancialDirectCostsItemDto } from "../dto/request/direct_cost_data.dto";
import { FinancialRevenueItemDto } from "../dto/request/revenue_data.dto";
import { FinancialOtherItemsDto } from "../dto/request/other_data.dto";
import { AddOrSubtract } from "../types/addOrSubtract.enum";
import { BusinessModel } from "src/modules/revenue-model/types/business_model.enum";

@Injectable()
export class FinancialQuarterItemMapper extends AbstractMapper<FinancialQuarterItemDto, FinancialQuarterEntity> {
    // eslint-disable-next-line complexity
    fromEntityToDTO(
        destination: ClassType<FinancialQuarterItemDto>,
        sourceObject: FinancialQuarterEntity,
    ): FinancialQuarterItemDto {
        if (!sourceObject) {
            return null;
        }
        let businessModel = BusinessModel.SaaS;

        if (sourceObject.financialItem && sourceObject.financialItem.budgetCategory) {
            let data: FinancialDirectCostsItemDto | FinancialRevenueItemDto | FinancialOtherItemsDto = null;
            if (sourceObject.financialItem.budgetCategory.type === BudgetCategory.DIRECT_COSTS) {
                if (sourceObject.financialItemManualCosts && sourceObject.financialItemManualCosts.length === 1) {
                    // is manual 
                    data = {
                        isManualInput: true,
                        currentValue: {
                            amount: Number((sourceObject.financialItemManualCosts[0].amount).toFixed(2)),
                        },
                        futureGrowth: {
                            expectedQuarterlyGrowth: sourceObject.financialItemManualCosts[0].quarterlyGrowth,
                        }
                    };
                } else if (sourceObject.financialItemDirectCosts && sourceObject.financialItemDirectCosts.length === 1) {
                    let revenueItemId;
                    if (sourceObject.financialItemDirectCosts[0].percentageFromFinancialQuarter
                        && sourceObject.financialItemDirectCosts[0].percentageFromFinancialQuarter.financialItem) {

                        revenueItemId = sourceObject.financialItemDirectCosts[0].percentageFromFinancialQuarter.financialItem.id;
                    }
                    data = {
                        isManualInput: false,
                        currentValue: {
                            revenueItemId,
                            revenueItemPercentage: sourceObject.financialItemDirectCosts[0].percentage,
                            addOrSubtract: sourceObject.financialItemDirectCosts[0].amount >= 0 ? AddOrSubtract.Add : AddOrSubtract.Subtract,
                            amount: Math.abs(sourceObject.financialItemDirectCosts[0].amount),
                        },
                    }
                }
            } else if (sourceObject.financialItem.budgetCategory.type === BudgetCategory.REVENUE) {
                if (sourceObject.financialItemManualCosts && sourceObject.financialItemManualCosts.length === 1) {
                    // is manual 
                    data = {
                        isManualInput: true,
                        currentValue: {
                            amount: Number((sourceObject.financialItemManualCosts[0].amount).toFixed(2)),
                        },
                        futureGrowth: {
                            expectedQuarterlyGrowth: sourceObject.financialItemManualCosts[0].quarterlyGrowth,
                        }
                    };
                } else if (sourceObject.financialItemRevenues && sourceObject.financialItemRevenues.length > 0) {
                    const financialItemRevenueFutureGrowth = sourceObject.financialItemRevenues[0].financialItemRevenueFutureGrowth;
                    data = {
                        isManualInput: false,
                        currentValue: sourceObject.financialItemRevenues.map(e => {
                            if (e.revenueItem?.revenueModel?.businessModel === BusinessModel.Other) {
                                businessModel = BusinessModel.Other;
                            }
                            return {
                                revenueSourceId: e.revenueItem.id,
                                quantity: Number((e.quantity).toFixed(2)),
                                price: e.price,
                            }
                        }),
                        futureGrowth: {
                            expectedQuarterlyGrowth: financialItemRevenueFutureGrowth.quarterlyGrowth,
                            quarter1Churn: financialItemRevenueFutureGrowth.quarter1Churn,
                            residualChurn: financialItemRevenueFutureGrowth.residualChurn,
                        },
                    }
                }
            } else {
                if (sourceObject.financialItemManualCosts && sourceObject.financialItemManualCosts.length === 1) {
                    data = {
                        amount: Number((sourceObject.financialItemManualCosts[0].amount).toFixed(2)),
                        expectedQuarterlyGrowth: sourceObject.financialItemManualCosts[0].quarterlyGrowth,
                    }
                }
            }

            return {
                financialItemId: sourceObject.financialItem.id,
                name: sourceObject.financialItem.item.name,
                description: sourceObject.financialItem.item.description,
                budgetCategoryId: sourceObject.financialItem.budgetCategory.id,
                budgetCategoryType: sourceObject.financialItem.budgetCategory.type,
                financialQuarterItemId: sourceObject.id,
                businessModel,
                data,
            }
        }

        return null;
    }
}
