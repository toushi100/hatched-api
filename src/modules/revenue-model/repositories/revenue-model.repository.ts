import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { RevenueModelEntity } from "../entities/revenue-model.entity";

@EntityRepository(RevenueModelEntity)
export class RevenueModelRepository extends AbstractRepository<RevenueModelEntity> {}
