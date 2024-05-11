import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { FinancialQuarterRatioEntity } from "../entities/financial-quarter-ratio.entity";

@EntityRepository(FinancialQuarterRatioEntity)
export class FinancialQuarterRatioRepository extends AbstractRepository<FinancialQuarterRatioEntity> { }
