import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EmployeeService } from "../employee/employee.service";

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);
    constructor(public readonly employeeService: EmployeeService) {}

    @Cron(CronExpression.EVERY_HOUR, {
        name: "Update employees vested shares",
        timeZone: "Africa/Cairo",
    })
    async handleCron() {
        try {
            this.logger.debug("Job started: Update employees vested shares");
            await this.employeeService.updateEmployeesVestedShares();
            this.logger.debug("Job ended: Updated employees vested shares successfully");
        } catch (e) {
            this.logger.error("Job Failed: Could not update employees vested shares\n", e);
        }
    }
}
