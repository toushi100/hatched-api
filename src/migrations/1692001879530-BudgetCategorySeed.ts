import { MigrationInterface, QueryRunner } from "typeorm";

export class BudgetCategorySeed1692001879530 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO budget_category (name, type, description) VALUES
        ('Revenue','REVENUE','Revenue'),
        ('Direct Costs','DIRECT_COSTS','Direct Costs'),
        ('Personnel Costs','PERSONNEL_COSTS','Personnel Costs'),
        ('Operating Expenses','OPERATING_EXPENSES','Operating Expenses')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM budget_category
        WHERE (type = 'REVENUE')
        OR (type = 'DIRECT_COSTS')
        OR (type = 'PERSONNEL_COSTS')
        OR (type = 'OPERATING_EXPENSES')`);
    }
}
