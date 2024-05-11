import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { FinancialQuarterEntity } from "../entities/financial-quarter.entity";

@EntityRepository(FinancialQuarterEntity)
export class FinancialQuarterRepository extends AbstractRepository<FinancialQuarterEntity> { }
