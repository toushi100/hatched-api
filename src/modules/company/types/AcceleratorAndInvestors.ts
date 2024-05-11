import { AcceleratorEntity } from "../../accelerator/entities/accelerator.entity";
import { UserEntity } from "../../core/user/entities/user.entity";

export interface AcceleratorAndInvestors {
    investors: UserEntity[];
    accelerator: AcceleratorEntity;
}
