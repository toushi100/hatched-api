import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { FinancialItemRevenueEntity } from "../entities/financial-item-revenue.entity";

@EntityRepository(FinancialItemRevenueEntity)
export class FinancialItemRevenueRepository extends AbstractRepository<FinancialItemRevenueEntity> { }
