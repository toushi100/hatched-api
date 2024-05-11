import { BaseEntity, Repository } from "typeorm";
import { SelectQueryBuilder } from "typeorm/query-builder/SelectQueryBuilder";
import { PaginationDto } from "./dto/pagination.dto";

export abstract class AbstractRepository<T extends BaseEntity> extends Repository<T> {

    addPagination(query: SelectQueryBuilder<T>, paginationDto: PaginationDto): void {
        if (query && paginationDto && paginationDto.applyPagination()) {
            query.skip(paginationDto.skip).take(paginationDto.take);
        }
    }
}
