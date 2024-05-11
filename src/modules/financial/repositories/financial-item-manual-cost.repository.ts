import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { FinancialItemManualCostEntity } from "../entities/financial-item-manual-cost.entity";

@EntityRepository(FinancialItemManualCostEntity)
export class FinancialItemManualCostRepository extends AbstractRepository<FinancialItemManualCostEntity> { }
