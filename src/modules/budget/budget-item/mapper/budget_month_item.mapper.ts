import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { BudgetMonthItemDto } from "../dto/response/budget_month_item.dto";
import { BudgetMonthEntity } from "../entities/budget-month.entity";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import { BudgetDirectCostsItemDto } from "../dto/request/direct_cost_data.dto";
import { BudgetRevenueItemDto } from "../dto/request/revenue_data.dto";
import { BudgetOtherItemsDto } from "../dto/request/other_data.dto";
import { AddOrSubtract } from "../../types/addOrSubtract.enum";
import { BusinessModel } from "src/modules/revenue-model/types/business_model.enum";

@Injectable()
export class BudgetMonthItemMapper extends AbstractMapper<BudgetMonthItemDto, BudgetMonthEntity> {
    // eslint-disable-next-line complexity
    fromEntityToDTO(
        destination: ClassType<BudgetMonthItemDto>,
        sourceObject: BudgetMonthEntity,
    ): BudgetMonthItemDto {
        if (!sourceObject) {
            return null;
        }
        let businessModel = BusinessModel.SaaS;

        if (sourceObject.budgetItem && sourceObject.budgetItem.budgetCategory) {
            let data: BudgetDirectCostsItemDto | BudgetRevenueItemDto | BudgetOtherItemsDto = null;
            if (sourceObject.budgetItem.budgetCategory.type === BudgetCategory.DIRECT_COSTS) {
                if (sourceObject.budgetItemManualCosts && sourceObject.budgetItemManualCosts.length === 1) {
                    // is manual 
                    data = {
                        isManualInput: true,
                        currentValue: {
                            amount: Number((sourceObject.budgetItemManualCosts[0].amount).toFixed(2)),
                        },
                        futureGrowth: {
                            expectedMonthlyGrowth: sourceObject.budgetItemManualCosts[0].monthlyGrowth,
                        }
                    };
                } else if (sourceObject.budgetItemDirectCosts && sourceObject.budgetItemDirectCosts.length === 1) {
                    let revenueItemId;
                    if (sourceObject.budgetItemDirectCosts[0].percentageFromBudgetMonth
                        && sourceObject.budgetItemDirectCosts[0].percentageFromBudgetMonth.budgetItem) {

                        revenueItemId = sourceObject.budgetItemDirectCosts[0].percentageFromBudgetMonth.budgetItem.id;
                    }
                    data = {
                        isManualInput: false,
                        currentValue: {
                            revenueItemId,
                            revenueItemPercentage: sourceObject.budgetItemDirectCosts[0].percentage,
                            addOrSubtract: sourceObject.budgetItemDirectCosts[0].amount >= 0 ? AddOrSubtract.Add : AddOrSubtract.Subtract,
                            amount: Math.abs(sourceObject.budgetItemDirectCosts[0].amount),
                        },
                    }
                }
            } else if (sourceObject.budgetItem.budgetCategory.type === BudgetCategory.REVENUE) {
                if (sourceObject.budgetItemManualCosts && sourceObject.budgetItemManualCosts.length === 1) {
                    // is manual 
                    data = {
                        isManualInput: true,
                        currentValue: {
                            amount: Number((sourceObject.budgetItemManualCosts[0].amount).toFixed(2)),
                        },
                        futureGrowth: {
                            expectedMonthlyGrowth: sourceObject.budgetItemManualCosts[0].monthlyGrowth,
                        }
                    };
                } else if (sourceObject.budgetItemRevenues && sourceObject.budgetItemRevenues.length > 0) {
                    const budgetItemRevenueFutureGrowth = sourceObject.budgetItemRevenues[0].budgetItemRevenueFutureGrowth;
                    data = {
                        isManualInput: false,
                        currentValue: sourceObject.budgetItemRevenues.map(e => {
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
                            expectedMonthlyGrowth: budgetItemRevenueFutureGrowth.monthlyGrowth,
                            month1ChurnRate: budgetItemRevenueFutureGrowth.month1Churn,
                            month2ChurnRate: budgetItemRevenueFutureGrowth.month2Churn,
                            month3ChurnRate: budgetItemRevenueFutureGrowth.month3Churn,
                            months4To12ChurnRate: budgetItemRevenueFutureGrowth.months4To12ChurnRate,
                        },
                    }
                }
            } else {
                if (sourceObject.budgetItemManualCosts && sourceObject.budgetItemManualCosts.length === 1) {
                    data = {
                        amount: Number((sourceObject.budgetItemManualCosts[0].amount).toFixed(2)),
                        expectedMonthlyGrowth: sourceObject.budgetItemManualCosts[0].monthlyGrowth,
                    }
                }
            }

            return {
                budgetItemId: sourceObject.budgetItem.id,
                name: sourceObject.budgetItem.item.name,
                description: sourceObject.budgetItem.item.description,
                budgetCategoryId: sourceObject.budgetItem.budgetCategory.id,
                budgetCategoryType: sourceObject.budgetItem.budgetCategory.type,
                budgetItemMonthId: sourceObject.id,
                businessModel,
                data,
            }
        }

        return null;
    }
}
