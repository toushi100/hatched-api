import { MigrationInterface, QueryRunner } from "typeorm";

export class InvestmentRoundAndInvestors1694683262892 implements MigrationInterface {
    name = "InvestmentRoundAndInvestors1694683262892";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "round_investor" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "round_investor_id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "nationality" character varying NOT NULL, "tax_no" character varying NOT NULL, "company_id" integer, CONSTRAINT "UQ_f8331690651ece39be5b9b04d70" UNIQUE ("email", "company_id"), CONSTRAINT "PK_0612f0bbb8ca938ee7653b70261" PRIMARY KEY ("round_investor_id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "round_investor_investment" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "investment_id" SERIAL NOT NULL, "invested_amount" double precision NOT NULL, "shares" double precision, "percentage" double precision NOT NULL, "nominal_price" double precision NOT NULL, "premium" double precision NOT NULL, "notes" text NOT NULL, "investor_id" integer, "investment_round_id" integer, CONSTRAINT "PK_e4b09d3e7d126bff2a4b9b8609e" PRIMARY KEY ("investment_id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "investment_round" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "investment_round_id" SERIAL NOT NULL, "name" character varying NOT NULL, "value_per_last_company_valuation" boolean NOT NULL DEFAULT false, "pre_money" double precision NOT NULL, "investment_amount" double precision NOT NULL, "post_money" double precision NOT NULL, "existing_shares" double precision NOT NULL, "existing_shares_less_esop" double precision NOT NULL, "new_shares" double precision NOT NULL, "total_shares_after_round" double precision NOT NULL, "round_closing_date" TIMESTAMP, "registration_date" TIMESTAMP, "company_id" integer, CONSTRAINT "PK_9297b5cac8faf9c12d032a779d0" PRIMARY KEY ("investment_round_id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "round_investor" ADD CONSTRAINT "FK_b220f5a82817c6718b3101986fd" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "round_investor_investment" ADD CONSTRAINT "FK_0f4d090ee06da2334e87f3a16e2" FOREIGN KEY ("investor_id") REFERENCES "round_investor"("round_investor_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "round_investor_investment" ADD CONSTRAINT "FK_5883f49a5debb3f5f83a136d508" FOREIGN KEY ("investment_round_id") REFERENCES "investment_round"("investment_round_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "investment_round" ADD CONSTRAINT "FK_4e74e28e059d250e945f4c0b13d" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "investment_round" DROP CONSTRAINT "FK_4e74e28e059d250e945f4c0b13d"`);
        await queryRunner.query(
            `ALTER TABLE "round_investor_investment" DROP CONSTRAINT "FK_5883f49a5debb3f5f83a136d508"`,
        );
        await queryRunner.query(
            `ALTER TABLE "round_investor_investment" DROP CONSTRAINT "FK_0f4d090ee06da2334e87f3a16e2"`,
        );
        await queryRunner.query(`ALTER TABLE "round_investor" DROP CONSTRAINT "FK_b220f5a82817c6718b3101986fd"`);
        await queryRunner.query(`DROP TABLE "investment_round"`);
        await queryRunner.query(`DROP TABLE "round_investor_investment"`);
        await queryRunner.query(`DROP TABLE "round_investor"`);
    }
}
