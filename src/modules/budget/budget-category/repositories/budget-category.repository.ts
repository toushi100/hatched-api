import { EntityRepository } from "typeorm";
import { AbstractRepository } from "../../../../common/abstract.repository";
import { BudgetCategoryEntity } from "../entities/budget-category.entity";

@EntityRepository(BudgetCategoryEntity)
export class BudgetCategoryRepository extends AbstractRepository<BudgetCategoryEntity> {}
