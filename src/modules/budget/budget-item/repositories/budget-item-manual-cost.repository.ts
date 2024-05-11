import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../../common/abstract.repository";
import { BudgetItemManualCostEntity } from "../entities/budget-item-manual-cost.entity";

@EntityRepository(BudgetItemManualCostEntity)
export class BudgetItemManualCostRepository extends AbstractRepository<BudgetItemManualCostEntity> { }
