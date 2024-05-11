import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { RoundInvestorEntity } from "../entities/round-investor.entity";

@EntityRepository(RoundInvestorEntity)
export class RoundInvestorRepository extends AbstractRepository<RoundInvestorEntity> {}
