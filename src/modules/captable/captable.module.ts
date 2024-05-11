import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { ConfigModule } from "../../configs";
import { CaptableController } from "./captable.controller";
import { CaptableService } from "./captable.service";
import { CompanyModule } from "../company/company.module";
import { EmployeeModule } from "../employee/employee.module";
import { ESOPModule } from "../esop/esop.module";
import { InvestmentRoundModule } from "../investment-round/investment_round.module";

@Module({
    imports: [
        SharedModule,
        ConfigModule,
        forwardRef(() => CompanyModule),
        forwardRef(() => InvestmentRoundModule),
        EmployeeModule,
        ESOPModule,
    ],
    controllers: [CaptableController],
    providers: [CaptableService],
    exports: [CaptableService],
})
export class CaptableModule {}
