import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreatedCompanyMapper } from "./mapper/createdCompany.mapper";
import { CompanyService } from "./services/company.service";
import { SharedModule } from "src/shared/shared.module";
import { ConfigModule } from "src/configs";
import { CompanyPlanDateRepository } from "./repositories/company-plan-date.repository";
import { CompanyRepository } from "./repositories/company.repository";
import { InvitationController } from "./controllers/invitation.controller";
import { InvestorRelationsController } from "./controllers/investor-relations.controller";
import { InvitationService } from "./services/invitation.service";
import { InvestorRelationService } from "./services/investor-relation.service";
import { PendingInvitationRepository } from "./repositories/pending-invitation.repository";
import { InvestorRelationMapper } from "./mapper/investor-realtion.mapper";
import { PendingInvitationMapper } from "./mapper/pending-invitation.mapper";
import { UserModule } from "../core/user/user.module";
import { AcceleratorModule } from "../accelerator/accelerator.module";
import { CompanyController } from "./controllers/company.controller";
import { UserRepository } from "../core/user/repositories/user.repository";
import { CompanyEntityMapper } from "./mapper/CompanyEntity.mapper";
import { ItemRepository } from "./repositories/item.repository";
import { FinancialModule } from "../financial/financial.module";
import { CreatedCompanyPlanDatesMapper } from "./mapper/createdCompanyPlanDates.mapper";
import { EmployeeModule } from "../employee/employee.module";
import { QueueEventModule } from "../queueEvent/queue-event.module";
import { ESOPModule } from "../esop/esop.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CompanyPlanDateRepository,
            UserRepository,
            CompanyRepository,
            PendingInvitationRepository,
            ItemRepository,
        ]),
        SharedModule,
        ConfigModule,
        forwardRef(() => AcceleratorModule),
        forwardRef(() => UserModule),
        forwardRef(() => FinancialModule),
        forwardRef(() => EmployeeModule),
        forwardRef(() => QueueEventModule),
        forwardRef(() => ESOPModule),
    ],

    controllers: [InvitationController, InvestorRelationsController, CompanyController],
    exports: [CompanyService, InvitationService, InvestorRelationService],
    providers: [
        CompanyService,
        CreatedCompanyMapper,
        InvestorRelationService,
        InvestorRelationMapper,
        InvitationService,
        PendingInvitationMapper,
        CompanyEntityMapper,
        CreatedCompanyPlanDatesMapper,
    ],
})
export class CompanyModule { }
