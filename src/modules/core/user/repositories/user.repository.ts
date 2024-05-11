import { Repository } from "typeorm";
import { EntityRepository } from "typeorm/decorator/EntityRepository";
import { UserEntity } from "../entities/user.entity";
import { AccountType } from "../account-type.enum";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { AcceleratorEntity } from "src/modules/accelerator/entities/accelerator.entity";
import { InternalServerErrorException } from "@nestjs/common";
import { DepartmentEntity } from "src/modules/department/entities/department.entity";
import { ItemEntity } from "src/modules/company/entities/item.entity";
import { EmployeeEntity } from "src/modules/employee/entities/employee.entity";
import { BudgetItemRevenueFutureGrowthEntity } from "src/modules/budget/budget-item/entities/budget-item-revenue-future-growth.entity";
import { FinancialItemRevenueFutureGrowthEntity } from "src/modules/financial/entities/financial-item-revenue-future-growth.entity";

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
    public async deleteUser(userId: number) {
        return this.manager.transaction(async (transactionEntityManager) => {
            const user = await transactionEntityManager.findOne(UserEntity, userId, {
                relations: [
                    "accelerator",
                    "company",
                    "company.items",
                    "company.departments",
                    "company.departments.employees",
                    "company.budgetItems",
                    "company.budgetItems.budgetItemRevenues",
                    "company.budgetItems.budgetItemRevenues.budgetItemRevenueFutureGrowth",
                    "company.financialItems",
                    "company.financialItems.financialItemRevenues",
                    "company.financialItems.financialItemRevenues.financialItemRevenueFutureGrowth",
                ],
            });
            if (user) {
                if (user.accountType === AccountType.STARTUP) {
                    // Delete employees and departments
                    const employeesIds = [];
                    const departmentsIds = [];
                    user.company.departments.forEach((dep) => {
                        departmentsIds.push(dep.id);
                        employeesIds.push(...dep.employees.map((emp) => emp.id));
                    });

                    if (employeesIds.length) {
                        await transactionEntityManager.delete(EmployeeEntity, employeesIds);
                    }
                    if (departmentsIds.length) {
                        await transactionEntityManager.delete(DepartmentEntity, departmentsIds);
                    }

                    // delete items revenue future growth
                    const budgetItemRevenueFutureGrowthIds = [];
                    const financialItemRevenueFutureGrowthIds = [];

                    user.company.budgetItems.forEach((item) =>
                        item.budgetItemRevenues.forEach((itemRev) =>
                            budgetItemRevenueFutureGrowthIds.push(itemRev.budgetItemRevenueFutureGrowth.id),
                        ),
                    );
                    if (budgetItemRevenueFutureGrowthIds.length) {
                        await transactionEntityManager.delete(
                            BudgetItemRevenueFutureGrowthEntity,
                            budgetItemRevenueFutureGrowthIds,
                        );
                    }

                    user.company.financialItems.forEach((item) =>
                        item.financialItemRevenues.forEach((itemRev) =>
                            financialItemRevenueFutureGrowthIds.push(itemRev.financialItemRevenueFutureGrowth.id),
                        ),
                    );
                    if (financialItemRevenueFutureGrowthIds.length) {
                        await transactionEntityManager.delete(
                            FinancialItemRevenueFutureGrowthEntity,
                            financialItemRevenueFutureGrowthIds,
                        );
                    }

                    // delete items
                    if (user.company.items.length) {
                        await transactionEntityManager.delete(
                            ItemEntity,
                            user.company.items.map((item) => item.id),
                        );
                    }

                    // delete company
                    await transactionEntityManager.delete(CompanyEntity, user.company.id);
                } else if (user.accountType === AccountType.ACCELERATOR) {
                    // delete accelerator
                    await transactionEntityManager.delete(AcceleratorEntity, user.accelerator.id);
                }

                // delete user
                await transactionEntityManager.delete(UserEntity, userId);
            } else {
                console.error("User not found! Could not delete user!");
                throw new InternalServerErrorException("User not found! Could not delete user!");
            }
        });
    }
}
