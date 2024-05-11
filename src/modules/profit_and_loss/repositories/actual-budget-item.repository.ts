import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { ActualBudgetItemEntity } from "../entities/actual-budget-item.entity";

@EntityRepository(ActualBudgetItemEntity)
export class ActualBudgetItemRepository extends AbstractRepository<ActualBudgetItemEntity> { }
