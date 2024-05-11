import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";

import { UserRoleEntity } from "../entities/role.entity";

@EntityRepository(UserRoleEntity)
export class RoleRepository extends Repository<UserRoleEntity> {}
