import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { AbstractEntity } from "../../../../common/abstract.entity";
import { UserRole } from "../user-role.enum";
import { Expose } from "class-transformer";

@Entity("role")
export class UserRoleEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({
        name: "role_id",
    })
    id: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.ADMIN,
        unique: true,
    })
    @Expose()
    name: UserRole;
}
