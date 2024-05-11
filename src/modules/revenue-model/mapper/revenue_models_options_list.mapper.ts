import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { RevenueModelDto } from "../dto/response/revenue_model.dto";
import { RevenueModelEntity } from "../entities/revenue-model.entity";

@Injectable()
export class RevenueModelOptionsListItemMapper extends AbstractMapper<RevenueModelDto, RevenueModelEntity> {
    // eslint-disable-next-line complexity
    fromEntityToDTO(destination: ClassType<RevenueModelDto>, sourceObject: RevenueModelEntity): RevenueModelDto {
        if (!sourceObject) {
            return null;
        }

        return {
            id: sourceObject.id,
            name: sourceObject.name,
            description: sourceObject.description,
            businessModel: sourceObject.businessModel,
        };
    }
}
