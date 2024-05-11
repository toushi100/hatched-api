import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AcceleratorEntity } from "../entities/accelerator.entity";

@EntityRepository(AcceleratorEntity)
export class AcceleratorRepository extends Repository<AcceleratorEntity> {}
