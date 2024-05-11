import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "../../configs";
import { ESOPController } from "./esop.controller";
import { ESOPService } from "./esop.service";
import { ESOPOptionsListItemMapper } from "./mapper/esop_options_list.mapper";
import { ESOPRepository } from "./repositories/esop.repository";
import { CompanyModule } from "../company/company.module";
import { ESOPEntity } from "./entities/esop.entity";
import { EmployeeModule } from "../employee/employee.module";
import { TotalESOPRepository } from "./repositories/total_esop.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([ESOPRepository, ESOPEntity, TotalESOPRepository]),
        SharedModule,
        ConfigModule,
        forwardRef(() => EmployeeModule),
        forwardRef(() => CompanyModule),
    ],
    controllers: [ESOPController],
    providers: [ESOPService, ESOPOptionsListItemMapper],
    exports: [ESOPService],
})
export class ESOPModule {}
