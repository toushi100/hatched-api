import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { DepartmentEntity } from "../entities/department.entity";

@EntityRepository(DepartmentEntity)
export class DepartmentRepository extends AbstractRepository<DepartmentEntity> {}
