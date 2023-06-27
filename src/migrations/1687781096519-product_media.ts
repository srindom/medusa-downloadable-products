import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductMedia1687781096519 implements MigrationInterface {
  name = "ProductMedia1687781096519";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."product_media_variant_type_enum" AS ENUM('preview', 'main')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_media_variant" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "product_media_id" character varying NOT NULL, "variant_id" character varying NOT NULL, "type" "public"."product_media_variant_type_enum" NOT NULL, CONSTRAINT "PK_b38718bc6a3891beb6e620be706" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_media" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "file" character varying NOT NULL, "mime_type" character varying NOT NULL, CONSTRAINT "PK_09d4639de8082a32aa27f3ac9a6" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product_media"`);
    await queryRunner.query(`DROP TABLE "product_media_variant"`);
    await queryRunner.query(
      `DROP TYPE "public"."product_media_variant_type_enum"`,
    );
  }
}
