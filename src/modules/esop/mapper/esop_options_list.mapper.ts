import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { ClassType } from "class-transformer-validator";
import { ESOPDto } from "../dto/response/esop.dto";
import { ESOPEntity } from "../entities/esop.entity";

@Injectable()
export class ESOPOptionsListItemMapper extends AbstractMapper<ESOPDto, ESOPEntity> {
    fromEntityToDTO(destination: ClassType<ESOPDto>, sourceObject: ESOPEntity): ESOPDto {
        if (!sourceObject) {
            return null;
        }

        return {
            id: sourceObject.id,
            name: sourceObject.name,
            numberOfYears: sourceObject.years,
            year1: sourceObject.year1,
            year2: sourceObject.year2,
            year3: sourceObject.year3,
            year4: sourceObject.year4,
            year5: sourceObject.year5,
            company: {
                companyId: sourceObject.company.id,
                name: sourceObject.company.name,
            },
        };
    }
}
