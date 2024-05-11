import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../../common/abstract.repository";
import { BudgetItemEntity } from "../entities/budget-item.entity";

@EntityRepository(BudgetItemEntity)
export class BudgetItemRepository extends AbstractRepository<BudgetItemEntity> {}
