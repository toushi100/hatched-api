import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { FinancialItemRevenueFutureGrowthEntity } from "../entities/financial-item-revenue-future-growth.entity";

@EntityRepository(FinancialItemRevenueFutureGrowthEntity)
export class FinancialItemRevenueFutureGrowthRepository extends AbstractRepository<FinancialItemRevenueFutureGrowthEntity> { }
