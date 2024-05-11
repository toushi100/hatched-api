import { Injectable } from "@nestjs/common";

import { AbstractMapper } from "../../../../common/abstract.mapper";
import { UserEntity } from "../entities/user.entity";
import { ClassType } from "class-transformer-validator";
import { UserPayloadDto } from "../dto/user-payload.dto";
import { UserRole } from "../user-role.enum";

@Injectable()
export class UserPayloadMapper extends AbstractMapper<UserPayloadDto, UserEntity> {
    fromDTOToEntity(destination: ClassType<UserEntity>, sourceObject: UserPayloadDto): UserEntity {
        return super.fromDTOToEntity(destination, sourceObject);
    }

    fromEntityToDTO(destination: ClassType<UserPayloadDto>, sourceObject: UserEntity): UserPayloadDto {
        const roles: UserRole[] = [];
        if (sourceObject.roles) {
            sourceObject.roles.forEach((role) => roles.push(role.name));
        }
        return {
            id: sourceObject.id,
            firstName: sourceObject.firstName,
            lastName: sourceObject.lastName,
            email: sourceObject.email,
            roles,
            accountType: sourceObject.accountType,
        };
    }
}
