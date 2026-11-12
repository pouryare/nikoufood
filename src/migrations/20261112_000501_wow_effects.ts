import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_page_film_scenes_sound" AS ENUM('none', 'farm', 'milk', 'sizzle');
  CREATE TABLE "home_page_table_dishes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"x" numeric NOT NULL,
  	"y" numeric NOT NULL,
  	"product_id" integer,
  	"note" varchar
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "effects_lamp" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_pattern" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_grain" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_pour_titles" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_golden_thread" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_page_transition" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_magnetic_buttons" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_smooth_scroll" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_sound" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_sizzle_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_farm_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_milk_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_click_id" integer;
  ALTER TABLE "ui_texts" ADD COLUMN "common_sound_on" varchar DEFAULT 'روشن کردن صدا';
  ALTER TABLE "ui_texts" ADD COLUMN "common_sound_off" varchar DEFAULT 'خاموش کردن صدا';
  ALTER TABLE "home_page_film_scenes" ADD COLUMN "sound" "enum_home_page_film_scenes_sound" DEFAULT 'none';
  ALTER TABLE "home_page_film_scenes" ADD COLUMN "single_video_mobile_id" integer;
  ALTER TABLE "home_page_film_scenes" ADD COLUMN "plant_video_mobile_id" integer;
  ALTER TABLE "home_page_film_scenes" ADD COLUMN "animal_video_mobile_id" integer;
  ALTER TABLE "home_page" ADD COLUMN "melt_enabled" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "melt_video_id" integer;
  ALTER TABLE "home_page" ADD COLUMN "melt_video_mobile_id" integer;
  ALTER TABLE "home_page" ADD COLUMN "melt_line" varchar;
  ALTER TABLE "home_page" ADD COLUMN "table_eyebrow" varchar;
  ALTER TABLE "home_page" ADD COLUMN "table_title" varchar;
  ALTER TABLE "home_page" ADD COLUMN "table_text" varchar;
  ALTER TABLE "home_page" ADD COLUMN "table_enabled" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "table_image_id" integer;
  ALTER TABLE "home_page" ADD COLUMN "table_hint" varchar;
  ALTER TABLE "home_page" ADD COLUMN "table_pair_label" varchar;
  ALTER TABLE "home_page_table_dishes" ADD CONSTRAINT "home_page_table_dishes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_table_dishes" ADD CONSTRAINT "home_page_table_dishes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_table_dishes_order_idx" ON "home_page_table_dishes" USING btree ("_order");
  CREATE INDEX "home_page_table_dishes_parent_id_idx" ON "home_page_table_dishes" USING btree ("_parent_id");
  CREATE INDEX "home_page_table_dishes_product_idx" ON "home_page_table_dishes" USING btree ("product_id");
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_sizzle_id_media_id_fk" FOREIGN KEY ("sounds_sizzle_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_farm_id_media_id_fk" FOREIGN KEY ("sounds_farm_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_milk_id_media_id_fk" FOREIGN KEY ("sounds_milk_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_click_id_media_id_fk" FOREIGN KEY ("sounds_click_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_single_video_mobile_id_media_id_fk" FOREIGN KEY ("single_video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_plant_video_mobile_id_media_id_fk" FOREIGN KEY ("plant_video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_animal_video_mobile_id_media_id_fk" FOREIGN KEY ("animal_video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_melt_video_id_media_id_fk" FOREIGN KEY ("melt_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_melt_video_mobile_id_media_id_fk" FOREIGN KEY ("melt_video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_table_image_id_media_id_fk" FOREIGN KEY ("table_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_sounds_sounds_sizzle_idx" ON "site_settings" USING btree ("sounds_sizzle_id");
  CREATE INDEX "site_settings_sounds_sounds_farm_idx" ON "site_settings" USING btree ("sounds_farm_id");
  CREATE INDEX "site_settings_sounds_sounds_milk_idx" ON "site_settings" USING btree ("sounds_milk_id");
  CREATE INDEX "site_settings_sounds_sounds_click_idx" ON "site_settings" USING btree ("sounds_click_id");
  CREATE INDEX "home_page_film_scenes_single_single_video_mobile_idx" ON "home_page_film_scenes" USING btree ("single_video_mobile_id");
  CREATE INDEX "home_page_film_scenes_plant_plant_video_mobile_idx" ON "home_page_film_scenes" USING btree ("plant_video_mobile_id");
  CREATE INDEX "home_page_film_scenes_animal_animal_video_mobile_idx" ON "home_page_film_scenes" USING btree ("animal_video_mobile_id");
  CREATE INDEX "home_page_melt_melt_video_idx" ON "home_page" USING btree ("melt_video_id");
  CREATE INDEX "home_page_melt_melt_video_mobile_idx" ON "home_page" USING btree ("melt_video_mobile_id");
  CREATE INDEX "home_page_table_table_image_idx" ON "home_page" USING btree ("table_image_id");
  -- The starter film scenes get their sounds (heard only when a visitor turns sound on).
  UPDATE "home_page_film_scenes" SET "sound" = 'farm' WHERE "kicker" = 'مزرعه';
  UPDATE "home_page_film_scenes" SET "sound" = 'milk' WHERE "kicker" = 'دانه | شیر';
  UPDATE "home_page_film_scenes" SET "sound" = 'sizzle' WHERE "kicker" = 'سفره';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page_table_dishes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "home_page_table_dishes" CASCADE;
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_sizzle_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_farm_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_milk_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_click_id_media_id_fk";
  
  ALTER TABLE "home_page_film_scenes" DROP CONSTRAINT "home_page_film_scenes_single_video_mobile_id_media_id_fk";
  
  ALTER TABLE "home_page_film_scenes" DROP CONSTRAINT "home_page_film_scenes_plant_video_mobile_id_media_id_fk";
  
  ALTER TABLE "home_page_film_scenes" DROP CONSTRAINT "home_page_film_scenes_animal_video_mobile_id_media_id_fk";
  
  ALTER TABLE "home_page" DROP CONSTRAINT "home_page_melt_video_id_media_id_fk";
  
  ALTER TABLE "home_page" DROP CONSTRAINT "home_page_melt_video_mobile_id_media_id_fk";
  
  ALTER TABLE "home_page" DROP CONSTRAINT "home_page_table_image_id_media_id_fk";
  
  DROP INDEX "site_settings_sounds_sounds_sizzle_idx";
  DROP INDEX "site_settings_sounds_sounds_farm_idx";
  DROP INDEX "site_settings_sounds_sounds_milk_idx";
  DROP INDEX "site_settings_sounds_sounds_click_idx";
  DROP INDEX "home_page_film_scenes_single_single_video_mobile_idx";
  DROP INDEX "home_page_film_scenes_plant_plant_video_mobile_idx";
  DROP INDEX "home_page_film_scenes_animal_animal_video_mobile_idx";
  DROP INDEX "home_page_melt_melt_video_idx";
  DROP INDEX "home_page_melt_melt_video_mobile_idx";
  DROP INDEX "home_page_table_table_image_idx";
  ALTER TABLE "site_settings" DROP COLUMN "effects_lamp";
  ALTER TABLE "site_settings" DROP COLUMN "effects_pattern";
  ALTER TABLE "site_settings" DROP COLUMN "effects_grain";
  ALTER TABLE "site_settings" DROP COLUMN "effects_pour_titles";
  ALTER TABLE "site_settings" DROP COLUMN "effects_golden_thread";
  ALTER TABLE "site_settings" DROP COLUMN "effects_page_transition";
  ALTER TABLE "site_settings" DROP COLUMN "effects_magnetic_buttons";
  ALTER TABLE "site_settings" DROP COLUMN "effects_smooth_scroll";
  ALTER TABLE "site_settings" DROP COLUMN "effects_sound";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_sizzle_id";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_farm_id";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_milk_id";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_click_id";
  ALTER TABLE "ui_texts" DROP COLUMN "common_sound_on";
  ALTER TABLE "ui_texts" DROP COLUMN "common_sound_off";
  ALTER TABLE "home_page_film_scenes" DROP COLUMN "sound";
  ALTER TABLE "home_page_film_scenes" DROP COLUMN "single_video_mobile_id";
  ALTER TABLE "home_page_film_scenes" DROP COLUMN "plant_video_mobile_id";
  ALTER TABLE "home_page_film_scenes" DROP COLUMN "animal_video_mobile_id";
  ALTER TABLE "home_page" DROP COLUMN "melt_enabled";
  ALTER TABLE "home_page" DROP COLUMN "melt_video_id";
  ALTER TABLE "home_page" DROP COLUMN "melt_video_mobile_id";
  ALTER TABLE "home_page" DROP COLUMN "melt_line";
  ALTER TABLE "home_page" DROP COLUMN "table_eyebrow";
  ALTER TABLE "home_page" DROP COLUMN "table_title";
  ALTER TABLE "home_page" DROP COLUMN "table_text";
  ALTER TABLE "home_page" DROP COLUMN "table_enabled";
  ALTER TABLE "home_page" DROP COLUMN "table_image_id";
  ALTER TABLE "home_page" DROP COLUMN "table_hint";
  ALTER TABLE "home_page" DROP COLUMN "table_pair_label";
  DROP TYPE "public"."enum_home_page_film_scenes_sound";`)
}
