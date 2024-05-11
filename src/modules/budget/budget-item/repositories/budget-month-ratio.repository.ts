import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../../common/abstract.repository";
import { BudgetMonthRatioEntity } from "../entities/budget-month-ratio.entity";

@EntityRepository(BudgetMonthRatioEntity)
export class BudgetMonthRatioRepository extends AbstractRepository<BudgetMonthRatioEntity> { }
