import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRevenueModelOptionsSeed1699786931197 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO revenue_model (name, description, business_model) VALUES
        ('Other', '','Other')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM revenue_model
        WHERE (name = 'Other')`);
    }

}
