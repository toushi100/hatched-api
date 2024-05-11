import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../../common/abstract.repository";
import { BudgetItemRevenueFutureGrowthEntity } from "../entities/budget-item-revenue-future-growth.entity";

@EntityRepository(BudgetItemRevenueFutureGrowthEntity)
export class BudgetItemRevenueFutureGrowthRepository extends AbstractRepository<BudgetItemRevenueFutureGrowthEntity> { }
