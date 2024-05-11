import { Injectable } from "@nestjs/common";
import { ClassType } from "class-transformer-validator";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { CreatedCompanyPlanDatesDto } from "../dto/response/created_company_plan_dates.dto";
import { CompanyPlanDateEntity } from "../entities/company-plan-date.entity";

@Injectable()
export class CreatedCompanyPlanDatesMapper extends AbstractMapper<CreatedCompanyPlanDatesDto, CompanyPlanDateEntity> {
    fromEntityToDTO(
        destination: ClassType<CreatedCompanyPlanDatesDto>,
        sourceObject?: CompanyPlanDateEntity,
    ): CreatedCompanyPlanDatesDto {
        if (!sourceObject) {
            return {
                budgetStartDate: null,
                budgetEndDate: null,
                financialStartDate: null,
                financialEndDate: null,
            };
        }
        return {
            budgetStartDate: sourceObject.budgetStartDate.toLocaleString("en-GB", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            }),
            budgetEndDate: sourceObject.budgetEndDate.toLocaleString("en-GB", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            }),
            financialStartDate: sourceObject.financialStartDate.toLocaleString("en-GB", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            }),
            financialEndDate: sourceObject.financialEndDate.toLocaleString("en-GB", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            }),
        };
    }
}
