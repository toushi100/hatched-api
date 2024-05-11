import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { CreatedFinancialItemDto } from "../dto/response/created_financial_item.dto";
import { FinancialItemEntity } from "../entities/financial-item.entity";

@Injectable()
export class CreatedFinancialItemMapper extends AbstractMapper<CreatedFinancialItemDto, FinancialItemEntity> {
    // eslint-disable-next-line complexity
    fromEntityToDTO(
        destination: ClassType<CreatedFinancialItemDto>,
        sourceObject: FinancialItemEntity,
    ): CreatedFinancialItemDto {
        if (!sourceObject) {
            return null;
        }

        return {
            financialItemId: sourceObject.id,
            name: sourceObject.item.name,
            description: sourceObject.item.description,
            budgetCategoryId: sourceObject.budgetCategory.id,
            budgetCategoryType: sourceObject.budgetCategory.type,
        };
    }
}
