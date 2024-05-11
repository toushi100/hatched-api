import {Injectable} from "@nestjs/common";
import {AbstractMapper} from "../../../common/abstract.mapper";
import {AcceleratorEntity} from "../entities/accelerator.entity";
import {AcceleratorListItemDto} from "../dto/response/accelerator_list_item.dto";

@Injectable()
export class AcceleratorListItemMapper extends AbstractMapper<AcceleratorListItemDto, AcceleratorEntity> {
    // eslint-disable-next-line complexity
    transformToDTO( sourceObject: AcceleratorEntity): AcceleratorListItemDto {
        if (!sourceObject) {
            return null;
        }

        return {
            acceleratorId: sourceObject.id,
            name: sourceObject.name,
            title: sourceObject.title,
            createdAt: sourceObject.createdAt,
        };
    }
}
