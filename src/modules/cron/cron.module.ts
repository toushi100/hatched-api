import { Module } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { ConfigModule } from "../../configs";
import { EmployeeModule } from "../employee/employee.module";
import { TasksService } from "./tasks.service";

@Module({
    imports: [SharedModule, ConfigModule, EmployeeModule],
    providers: [TasksService],
    exports: [TasksService],
})
export class CronModule {}
