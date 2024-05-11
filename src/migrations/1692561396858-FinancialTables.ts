import {MigrationInterface, QueryRunner} from "typeorm";

export class FinancialTables1692561396858 implements MigrationInterface {
    name = 'FinancialTables1692561396858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "financial_item_direct_cost" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "financial_item_direct_cost_id" SERIAL NOT NULL, "percentage" double precision NOT NULL DEFAULT '0', "amount" double precision NOT NULL DEFAULT '0', "old_added_value" double precision NOT NULL DEFAULT '0', "financial_quarter_id" integer, "financial_item_id" integer, "percentage_from_financial_quarter_id" integer, CONSTRAINT "PK_5eb0cf1733fdafa3c01059fcb7e" PRIMARY KEY ("financial_item_direct_cost_id"))`);
        await queryRunner.query(`CREATE TABLE "financial_item_manual_cost" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "financial_item_manual_cost_id" SERIAL NOT NULL, "quarterly_growth" double precision NOT NULL DEFAULT '0', "amount" double precision NOT NULL DEFAULT '0', "old_added_value" double precision NOT NULL DEFAULT '0', "parent_financial_item_manual_cost_id" integer, "financial_quarter_id" integer, "financial_item_id" integer, CONSTRAINT "PK_da64a7bbcb794ed974ac9095dff" PRIMARY KEY ("financial_item_manual_cost_id"))`);
        await queryRunner.query(`CREATE TABLE "financial_quarter" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "financial_quarter_id" SERIAL NOT NULL, "quarter_date" TIMESTAMP NOT NULL, "quarter_number" integer NOT NULL, "value" double precision NOT NULL DEFAULT '0', "display_order" integer, "financial_item_id" integer, CONSTRAINT "PK_76fb059ed5ff20605a94aec341a" PRIMARY KEY ("financial_quarter_id"))`);
        await queryRunner.query(`CREATE TABLE "financial_item_revenue_future_growth" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "financial_item_revenue_future_growth_id" SERIAL NOT NULL, "quarterly_growth" double precision NOT NULL DEFAULT '0', "quarter1_churn" double precision NOT NULL DEFAULT '0', "residual_churn" double precision NOT NULL DEFAULT '0', CONSTRAINT "PK_75bca64cfe2cfb7ea5ad988dce1" PRIMARY KEY ("financial_item_revenue_future_growth_id"))`);
        await queryRunner.query(`CREATE TABLE "financial_item_revenue" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "financial_item_revenue_id" SERIAL NOT NULL, "quantity" double precision NOT NULL DEFAULT '0', "price" double precision NOT NULL DEFAULT '0', "old_added_value" double precision NOT NULL DEFAULT '0', "quantity_exist_for_zero_quarter" double precision NOT NULL DEFAULT '0', "quantity_exist_for_one_quarter" double precision NOT NULL DEFAULT '0', "quantity_exist_for_two_or_more_quarters" double precision NOT NULL DEFAULT '0', "parent_financial_item_revenue_id" integer, "financial_item_revenue_future_growth_id" integer, "revenue_item_id" integer, "financial_item_id" integer, "financial_quarter_id" integer, CONSTRAINT "PK_3ca295bdf7664d84b6fe2321cd3" PRIMARY KEY ("financial_item_revenue_id"))`);
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" ADD CONSTRAINT "FK_6103599fd569046715bea24dc62" FOREIGN KEY ("financial_quarter_id") REFERENCES "financial_quarter"("financial_quarter_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" ADD CONSTRAINT "FK_ecf8cde4dcfffa86fc2d3fc63a0" FOREIGN KEY ("financial_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" ADD CONSTRAINT "FK_b7fece8d523210c45ab0bc2e1df" FOREIGN KEY ("percentage_from_financial_quarter_id") REFERENCES "financial_quarter"("financial_quarter_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_manual_cost" ADD CONSTRAINT "FK_61226f4fb212303eddd87394f72" FOREIGN KEY ("parent_financial_item_manual_cost_id") REFERENCES "financial_item_manual_cost"("financial_item_manual_cost_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_manual_cost" ADD CONSTRAINT "FK_505070170ddc8ee3f8e03e87195" FOREIGN KEY ("financial_quarter_id") REFERENCES "financial_quarter"("financial_quarter_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_manual_cost" ADD CONSTRAINT "FK_73be78eb63a158872b6cf17b494" FOREIGN KEY ("financial_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" ADD CONSTRAINT "FK_470b9bea85dcf17c80fb974e3c2" FOREIGN KEY ("financial_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD CONSTRAINT "FK_f9889f1409f768637ee69bd15c5" FOREIGN KEY ("parent_financial_item_revenue_id") REFERENCES "financial_item_revenue"("financial_item_revenue_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD CONSTRAINT "FK_2d361c47fb628dc6d15395dc67e" FOREIGN KEY ("financial_item_revenue_future_growth_id") REFERENCES "financial_item_revenue_future_growth"("financial_item_revenue_future_growth_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD CONSTRAINT "FK_cb9cd8334f3ea53118826f8f067" FOREIGN KEY ("revenue_item_id") REFERENCES "revenue_item"("revenue_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD CONSTRAINT "FK_cc11a1e3e96cd8facc43819691f" FOREIGN KEY ("financial_item_id") REFERENCES "financial_item"("financial_item_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" ADD CONSTRAINT "FK_8ddc6b3f92aa2998f63c39724d1" FOREIGN KEY ("financial_quarter_id") REFERENCES "financial_quarter"("financial_quarter_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP CONSTRAINT "FK_8ddc6b3f92aa2998f63c39724d1"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP CONSTRAINT "FK_cc11a1e3e96cd8facc43819691f"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP CONSTRAINT "FK_cb9cd8334f3ea53118826f8f067"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP CONSTRAINT "FK_2d361c47fb628dc6d15395dc67e"`);
        await queryRunner.query(`ALTER TABLE "financial_item_revenue" DROP CONSTRAINT "FK_f9889f1409f768637ee69bd15c5"`);
        await queryRunner.query(`ALTER TABLE "financial_quarter" DROP CONSTRAINT "FK_470b9bea85dcf17c80fb974e3c2"`);
        await queryRunner.query(`ALTER TABLE "financial_item_manual_cost" DROP CONSTRAINT "FK_73be78eb63a158872b6cf17b494"`);
        await queryRunner.query(`ALTER TABLE "financial_item_manual_cost" DROP CONSTRAINT "FK_505070170ddc8ee3f8e03e87195"`);
        await queryRunner.query(`ALTER TABLE "financial_item_manual_cost" DROP CONSTRAINT "FK_61226f4fb212303eddd87394f72"`);
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" DROP CONSTRAINT "FK_b7fece8d523210c45ab0bc2e1df"`);
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" DROP CONSTRAINT "FK_ecf8cde4dcfffa86fc2d3fc63a0"`);
        await queryRunner.query(`ALTER TABLE "financial_item_direct_cost" DROP CONSTRAINT "FK_6103599fd569046715bea24dc62"`);
        await queryRunner.query(`DROP TABLE "financial_item_revenue"`);
        await queryRunner.query(`DROP TABLE "financial_item_revenue_future_growth"`);
        await queryRunner.query(`DROP TABLE "financial_quarter"`);
        await queryRunner.query(`DROP TABLE "financial_item_manual_cost"`);
        await queryRunner.query(`DROP TABLE "financial_item_direct_cost"`);
    }

}
