import { Module } from "@nestjs/common";
import { CoreModule } from "./modules/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { StaticTextModule } from "./modules/static-text/static-text.module";
import { ConfigModule, ConfigService } from "./configs";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import * as path from "path";
import { AcceptLanguageResolver, HeaderResolver, I18nJsonParser, I18nModule, QueryResolver } from "nestjs-i18n";
import { join } from "path";
import { EtFileManagerModule } from "./modules/et-file-manager/et-file-manager.module";
import { EmployeeModule } from "./modules/employee/employee.module";
import { DepartmentModule } from "./modules/department/department.module";
import { RevenueModelModule } from "./modules/revenue-model/revenue-model.module";
import { BudgetModule } from "./modules/budget/budget.module";
import { FinancialModule } from "./modules/financial/financial.module";
import { CompanyModule } from "./modules/company/company.module";
import { ESOPModule } from "./modules/esop/esop.module";
import { AcceleratorModule } from "./modules/accelerator/accelerator.module";
import { CaptableModule } from "./modules/captable/captable.module";
import { ValuationModule } from "./modules/valuation/valuation.module";
import { InvestorModule } from "./modules/investor/investor.module";
import { InvestmentRoundModule } from "./modules/investment-round/investment_round.module";
import { QueueEventModule } from "./modules/queueEvent/queue-event.module";
import { ProfitLossModule } from "./modules/profit_and_loss/profit-loss.module";
import { CronModule } from "./modules/cron/cron.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => configService.typeOrmConfig,
            inject: [ConfigService],
        }),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.ENV_CONFIG.SMTP_SERVER_HOST,
                    port: configService.ENV_CONFIG.SMTP_SERVER_PORT,
                    requireTLS: true,
                    auth: {
                        user: configService.ENV_CONFIG.SMTP_SERVER_USER_NAME,
                        pass: configService.ENV_CONFIG.SMTP_SERVER_PASSWORD,
                    },
                },
                template: {
                    dir: path.resolve(__dirname, "shared", "mail-templates"),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
        I18nModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                fallbackLanguage: configService.ENV_CONFIG.FALLBACK_LANGUAGE, // e.g., 'en'
                parserOptions: {
                    path: join(__dirname, "/i18n/"),
                    // add this to enable live translations
                    watch: true,
                },
            }),
            parser: I18nJsonParser,
            resolvers: [new QueryResolver(["lang", "locale", "l"]), new HeaderResolver(), AcceptLanguageResolver],
            inject: [ConfigService],
        }),
        ScheduleModule.forRoot(),
        CoreModule,
        StaticTextModule,
        CompanyModule,
        EmployeeModule,
        DepartmentModule,
        EtFileManagerModule,
        RevenueModelModule,
        BudgetModule,
        FinancialModule,
        ESOPModule,
        AcceleratorModule,
        CaptableModule,
        ValuationModule,
        InvestorModule,
        InvestmentRoundModule,
        QueueEventModule,
        ProfitLossModule,
        CronModule,
        DashboardModule,
    ],
})
export class AppModule {}
