import { plainToClass } from "class-transformer";
import { AbstractEntity } from "./abstract.entity";
import { AbstractDto } from "./dto/abstract-dto";
import { ClassType } from "class-transformer-validator";

export class AbstractMapper<T extends AbstractDto, K extends AbstractEntity> {
    protected fromEntityToDTO(destination: ClassType<T>, sourceObject: K, lang?: string): T {
        return plainToClass(destination, sourceObject, {
            excludeExtraneousValues: true,
        });
    }

    protected fromDTOToEntity(destination: ClassType<K>, sourceObject: T, lang?: string): K {
        return plainToClass(destination, sourceObject, {
            excludeExtraneousValues: true,
        });
    }
}
