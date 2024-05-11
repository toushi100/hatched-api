import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { CompanyEntity } from "../entities/company.entity";

@EntityRepository(CompanyEntity)
export class CompanyRepository extends Repository<CompanyEntity> {}
