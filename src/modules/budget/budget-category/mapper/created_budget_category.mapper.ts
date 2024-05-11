import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { CreatedBudgetCategoryDto } from "../dto/response/created_budget_category.dto";
import { BudgetCategoryEntity } from "../entities/budget-category.entity";

@Injectable()
export class CreatedBudgetCategoryMapper extends AbstractMapper<CreatedBudgetCategoryDto, BudgetCategoryEntity> {
    fromEntityToDTO(
        destination: ClassType<CreatedBudgetCategoryDto>,
        sourceObject: BudgetCategoryEntity,
    ): CreatedBudgetCategoryDto {
        if (!sourceObject) {
            return null;
        }

        return {
            budgetCategoryId: sourceObject.id,
            name: sourceObject.name,
            type: sourceObject.type,
            description: sourceObject.description,
            displayOrder: sourceObject.displayOrder,
        };
    }
}
