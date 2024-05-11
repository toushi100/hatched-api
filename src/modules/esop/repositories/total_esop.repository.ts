import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { TotalESOPEntity } from "../entities/total_esop.entity";

@EntityRepository(TotalESOPEntity)
export class TotalESOPRepository extends AbstractRepository<TotalESOPEntity> {}
