import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { CreatedBudgetItemDto } from "../dto/response/created_budget_item.dto";
import { BudgetItemEntity } from "../entities/budget-item.entity";

@Injectable()
export class CreatedBudgetItemMapper extends AbstractMapper<CreatedBudgetItemDto, BudgetItemEntity> {
    // eslint-disable-next-line complexity
    fromEntityToDTO(
        destination: ClassType<CreatedBudgetItemDto>,
        sourceObject: BudgetItemEntity,
    ): CreatedBudgetItemDto {
        if (!sourceObject) {
            return null;
        }

        return {
            budgetItemId: sourceObject.id,
            name: sourceObject.item.name,
            description: sourceObject.item.description,
            budgetCategoryId: sourceObject.budgetCategory.id,
            budgetCategoryType: sourceObject.budgetCategory.type,
        };
    }
}
