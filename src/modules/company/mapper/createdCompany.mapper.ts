import { Injectable } from "@nestjs/common";
import { ClassType } from "class-transformer-validator";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { CreatedCompanyDto } from "../dto/response/created_company.dto";
import { CompanyEntity } from "../entities/company.entity";

@Injectable()
export class CreatedCompanyMapper extends AbstractMapper<CreatedCompanyDto, CompanyEntity> {
    fromDTOToEntity(destination: ClassType<CompanyEntity>, sourceObject: CreatedCompanyDto): CompanyEntity {
        return super.fromDTOToEntity(destination, sourceObject);
    }

    fromEntityToDTO(destination: ClassType<CreatedCompanyDto>, sourceObject: CompanyEntity): CreatedCompanyDto {
        return super.fromEntityToDTO(destination, sourceObject);
    }
}
