import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../../common/abstract.repository";
import { BudgetMonthEntity } from "../entities/budget-month.entity";

@EntityRepository(BudgetMonthEntity)
export class BudgetMonthRepository extends AbstractRepository<BudgetMonthEntity> { }
