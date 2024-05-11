import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../../common/abstract.repository";
import { BudgetItemRevenueEntity } from "../entities/budget-item-revenue.entity";

@EntityRepository(BudgetItemRevenueEntity)
export class BudgetItemRevenueRepository extends AbstractRepository<BudgetItemRevenueEntity> { }
