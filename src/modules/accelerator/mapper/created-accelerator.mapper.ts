import { Injectable } from "@nestjs/common";
import { ClassType } from "class-transformer-validator";
import { AbstractMapper } from "../../../common/abstract.mapper";
import { CreatedAcceleratorDto } from "../dto/response/created_accelerator.dto";
import { AcceleratorEntity } from "../entities/accelerator.entity";

@Injectable()
export class CreatedAcceleratorMapper extends AbstractMapper<CreatedAcceleratorDto, AcceleratorEntity> {
    fromDTOToEntity(destination: ClassType<AcceleratorEntity>, sourceObject: CreatedAcceleratorDto): AcceleratorEntity {
        return super.fromDTOToEntity(destination, sourceObject);
    }

    fromEntityToDTO(
        destination: ClassType<CreatedAcceleratorDto>,
        sourceObject: AcceleratorEntity,
    ): CreatedAcceleratorDto {
        return super.fromEntityToDTO(destination, sourceObject);
    }
}
