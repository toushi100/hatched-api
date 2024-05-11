import { Injectable } from "@nestjs/common";

import { AbstractMapper } from "../../../../common/abstract.mapper";
import { UserDto } from "../dto/user.dto";
import { UserEntity } from "../entities/user.entity";
import { ClassType } from "class-transformer-validator";
import { UserProfileDto } from "../dto/response/user-profile.dto";

@Injectable()
export class UserProfileMapper extends AbstractMapper<UserProfileDto, UserEntity> {
    fromDTOToEntity(destination: ClassType<UserEntity>, sourceObject: UserProfileDto): UserEntity {
        return super.fromDTOToEntity(destination, sourceObject);
    }

    fromEntityToDTO(destination: ClassType<UserProfileDto>, sourceObject: UserEntity): UserProfileDto {
        return super.fromEntityToDTO(destination, sourceObject);
    }
}
