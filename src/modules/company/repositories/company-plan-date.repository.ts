import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { CompanyPlanDateEntity } from "../entities/company-plan-date.entity";

@EntityRepository(CompanyPlanDateEntity)
export class CompanyPlanDateRepository extends Repository<CompanyPlanDateEntity> { }
