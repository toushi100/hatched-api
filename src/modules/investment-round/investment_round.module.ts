import { Module, forwardRef } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "../../configs";
import { InvestmentRoundController } from "./investment_round.controller";
import { InvestmentRoundService } from "./services/investment_round.service";
import { RoundInvestorService } from "./services/round_investor.service";
import { InvestmentRoundRepository } from "./repositories/investment_round.repository";
import { RoundInvestorRepository } from "./repositories/round-investor.repository";
import { CreatedInvestmentRoundMapper } from "./mapper/created_investment_round.mapper";
import { InvestorRoundInvestmentMapper } from "./mapper/investment_round_investor.mapper";
import { CompanyModule } from "../company/company.module";
import { ValuationModule } from "../valuation/valuation.module";
import { CaptableModule } from "../captable/captable.module";

@Module({
    imports: [
        SharedModule,
        TypeOrmModule.forFeature([InvestmentRoundRepository, RoundInvestorRepository]),
        forwardRef(() => CompanyModule),
        ConfigModule,
        ValuationModule,
        forwardRef(() => CaptableModule),
    ],
    controllers: [InvestmentRoundController],
    providers: [
        InvestmentRoundService,
        CreatedInvestmentRoundMapper,
        RoundInvestorService,
        InvestorRoundInvestmentMapper,
    ],
    exports: [InvestmentRoundService, RoundInvestorService],
})
export class InvestmentRoundModule {}
