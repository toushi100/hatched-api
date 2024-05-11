import { Injectable } from "@nestjs/common";

import { AbstractMapper } from "../../../../common/abstract.mapper";
import { UserDto } from "../dto/user.dto";
import { UserEntity } from "../entities/user.entity";
import { ClassType } from "class-transformer-validator";

@Injectable()
export class UserMapper extends AbstractMapper<UserDto, UserEntity> {
    fromDTOToEntity(destination: ClassType<UserEntity>, sourceObject: UserDto): UserEntity {
        return super.fromDTOToEntity(destination, sourceObject);
    }

    fromEntityToDTO(destination: ClassType<UserDto>, sourceObject: UserEntity): UserDto {
        return super.fromEntityToDTO(destination, sourceObject);
    }
}
