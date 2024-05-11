import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { ActualBudgetMonthEntity } from "../entities/actual-budget-month.entity";

@EntityRepository(ActualBudgetMonthEntity)
export class ActualBudgetMonthRepository extends AbstractRepository<ActualBudgetMonthEntity> { }
