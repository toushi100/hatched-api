import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { ItemEntity } from "../entities/item.entity";

@EntityRepository(ItemEntity)
export class ItemRepository extends Repository<ItemEntity> { }
