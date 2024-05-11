import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { RevenueItemEntity } from "../entities/revenue-item.entity";

@EntityRepository(RevenueItemEntity)
export class RevenueItemRepository extends AbstractRepository<RevenueItemEntity> {}
