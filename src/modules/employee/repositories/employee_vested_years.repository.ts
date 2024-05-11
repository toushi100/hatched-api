import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { AbstractRepository } from "../../../common/abstract.repository";
import { EmployeeVestedYearsEntity } from "../entities/employee_vested_years.entity";

@EntityRepository(EmployeeVestedYearsEntity)
export class EmployeeVestedYearsRepository extends AbstractRepository<EmployeeVestedYearsEntity> {}
