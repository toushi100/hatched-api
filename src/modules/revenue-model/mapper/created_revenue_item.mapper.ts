import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { CreatedRevenueItemDto } from "../dto/response/created_revenue_item.dto";
import { RevenueItemEntity } from "../entities/revenue-item.entity";

@Injectable()
export class CreatedRevenueItemMapper extends AbstractMapper<CreatedRevenueItemDto, RevenueItemEntity> {
    fromEntityToDTO(
        destination: ClassType<CreatedRevenueItemDto>,
        sourceObject: RevenueItemEntity,
    ): CreatedRevenueItemDto {
        if (!sourceObject) {
            return null;
        }

        return {
            revenueItemId: sourceObject.id,
            name: sourceObject.name,
            description: sourceObject.description,
            initialPrice: sourceObject.initialPrice,
            revenueModel: sourceObject.revenueModel,
            company: {
                companyId: sourceObject.company.id,
                name: sourceObject.company.name,
            },
        };
    }
}
