import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { FinancialItemDirectCostEntity } from "../entities/financial-item-direct-cost.entity";

@EntityRepository(FinancialItemDirectCostEntity)
export class FinancialItemDirectCostRepository extends AbstractRepository<FinancialItemDirectCostEntity> { }
