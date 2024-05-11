import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { FinancialItemEntity } from "../entities/financial-item.entity";

@EntityRepository(FinancialItemEntity)
export class FinancialItemRepository extends AbstractRepository<FinancialItemEntity> {}
