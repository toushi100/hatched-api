import { MigrationInterface, QueryRunner } from "typeorm";

export class RevenueModelOptionsSeed1691425190538 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO revenue_model (name, description, business_model) VALUES
        ('Subscription fee (Packages)', 'Subscription fee (Packages)','SaaS'),
        ('Pay-per-seat (Licenses)','Pay-per-seat (Licenses)', 'SaaS'),
        ('Pay-per-usage (Transactions)','Pay-per-usage (Transactions)','SaaS')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM revenue_model
        WHERE (name = 'Subscription fee (Packages)')
        OR (name = 'Pay-per-seat (Licenses)')
        OR (name = 'Pay-per-usage (Transactions)')`);
    }
}
