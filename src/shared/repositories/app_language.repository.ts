import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";

import { AppLanguageEntity } from "../entities/app_languge.entity";

@EntityRepository(AppLanguageEntity)
export class AppLanguageRepository extends Repository<AppLanguageEntity> {}
