import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../../common/abstract.repository";
import { BudgetItemDirectCostEntity } from "../entities/budget-item-direct-cost.entity";

@EntityRepository(BudgetItemDirectCostEntity)
export class BudgetItemDirectCostRepository extends AbstractRepository<BudgetItemDirectCostEntity> { }
