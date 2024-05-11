import { Injectable } from "@nestjs/common";
import { ClassType } from "class-transformer-validator";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { CompanyEntity } from "../entities/company.entity";
import { CompanyEntityDto } from "../dto/response/company_entity.dto";
import { UserEntity } from "../../core/user/entities/user.entity";

@Injectable()
export class CompanyEntityMapper extends AbstractMapper<CompanyEntityDto, CompanyEntity> {


    transformToDTO(sourceObject: UserEntity): CompanyEntityDto {
        if (!sourceObject) {
            return null;
        }
        return {
            companyId: sourceObject.company.id,
            name: sourceObject.company.name,
            logo: sourceObject.company.logo,
            website: sourceObject.company.website,
            iosURL: sourceObject.company.iosURL,
            playStoreURL: sourceObject.company.playStoreURL,
            fbURL: sourceObject.company.fbURL,
            igURL: sourceObject.company.iosURL,
            linkedinURL: sourceObject.company.linkedinURL,
            twitterURL: sourceObject.company.twitterURL,
            jobTitle: sourceObject.jobTitle,
            acceleratorId: sourceObject?.company?.accelerator?.id,
        }
    }
}
