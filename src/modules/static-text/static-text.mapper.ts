import { Injectable } from "@nestjs/common";
import { AbstractMapper } from "../../common/abstract.mapper";
import { StaticTextDto } from "./dto/static-text.dto";
import { StaticTextEntity } from "./entities/static-text.entity";
import { ClassType } from "class-transformer-validator";

@Injectable()
export class StaticTextMapper extends AbstractMapper<StaticTextDto, StaticTextEntity> {
    fromDTOToEntity(destination: ClassType<StaticTextEntity>, sourceObject: StaticTextDto): StaticTextEntity {
        return super.fromDTOToEntity(destination, sourceObject);
    }

    // eslint-disable-next-line complexity
    fromEntityToDTO(destination: ClassType<StaticTextDto>, sourceObject: StaticTextEntity): StaticTextDto {
        return {
            keyDescription: sourceObject.keyDescription,
            textKey: sourceObject.textKey,
            value:
                sourceObject.staticTextTranslations && sourceObject.staticTextTranslations[0]
                    ? sourceObject.staticTextTranslations[0].value
                    : null,
        };
    }
}
