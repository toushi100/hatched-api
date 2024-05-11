import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { ActualBudgetMonthRatioEntity } from "../entities/actual-budget-month-ratio.entity";

@EntityRepository(ActualBudgetMonthRatioEntity)
export class ActualBudgetMonthRatioRepository extends AbstractRepository<ActualBudgetMonthRatioEntity> { }
