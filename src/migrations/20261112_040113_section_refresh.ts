import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_product_categories_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check', 'cloche', 'bed', 'pot', 'store', 'cart', 'boxes', 'factory', 'route', 'grid', 'sparkle', 'flame', 'calendar', 'target', 'trend', 'handshake', 'phone', 'pin');
  CREATE TYPE "public"."enum_fat_types_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check', 'cloche', 'bed', 'pot', 'store', 'cart', 'boxes', 'factory', 'route', 'grid', 'sparkle', 'flame', 'calendar', 'target', 'trend', 'handshake', 'phone', 'pin');
  CREATE TYPE "public"."enum_markets_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check', 'cloche', 'bed', 'pot', 'store', 'cart', 'boxes', 'factory', 'route', 'grid', 'sparkle', 'flame', 'calendar', 'target', 'trend', 'handshake', 'phone', 'pin');
  CREATE TYPE "public"."enum_home_page_distribution_steps_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check', 'cloche', 'bed', 'pot', 'store', 'cart', 'boxes', 'factory', 'route', 'grid', 'sparkle', 'flame', 'calendar', 'target', 'trend', 'handshake', 'phone', 'pin');
  CREATE TYPE "public"."enum_home_page_butter_stops" AS ENUM('hero', 'intro', 'sizes', 'finder', 'table');
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'cloche';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'bed';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'pot';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'store';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'cart';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'boxes';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'factory';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'route';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'grid';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'sparkle';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'flame';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'calendar';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'target';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'trend';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'handshake';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'phone';
  ALTER TYPE "public"."enum_home_page_trust_items_icon" ADD VALUE 'pin';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'cloche';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'bed';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'pot';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'store';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'cart';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'boxes';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'factory';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'route';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'grid';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'sparkle';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'flame';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'calendar';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'target';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'trend';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'handshake';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'phone';
  ALTER TYPE "public"."enum_about_page_values_icon" ADD VALUE 'pin';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'cloche';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'bed';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'pot';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'store';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'cart';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'boxes';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'factory';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'route';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'grid';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'sparkle';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'flame';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'calendar';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'target';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'trend';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'handshake';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'phone';
  ALTER TYPE "public"."enum_network_page_steps_icon" ADD VALUE 'pin';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'cloche';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'bed';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'pot';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'store';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'cart';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'boxes';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'factory';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'route';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'grid';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'sparkle';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'flame';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'calendar';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'target';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'trend';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'handshake';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'phone';
  ALTER TYPE "public"."enum_representation_page_requirements_icon" ADD VALUE 'pin';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'cloche';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'bed';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'pot';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'store';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'cart';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'boxes';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'factory';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'route';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'grid';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'sparkle';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'flame';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'calendar';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'target';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'trend';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'handshake';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'phone';
  ALTER TYPE "public"."enum_representation_page_process_icon" ADD VALUE 'pin';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'cloche';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'bed';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'pot';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'store';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'cart';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'boxes';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'factory';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'route';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'grid';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'sparkle';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'flame';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'calendar';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'target';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'trend';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'handshake';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'phone';
  ALTER TYPE "public"."enum_partnership_page_audiences_icon" ADD VALUE 'pin';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'cloche';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'bed';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'pot';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'store';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'cart';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'boxes';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'factory';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'route';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'grid';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'sparkle';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'flame';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'calendar';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'target';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'trend';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'handshake';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'phone';
  ALTER TYPE "public"."enum_partnership_page_benefits_icon" ADD VALUE 'pin';
  CREATE TABLE "home_page_distribution_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"short" varchar,
  	"icon" "enum_home_page_distribution_steps_icon" DEFAULT 'none'
  );
  
  CREATE TABLE "home_page_butter_stops" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_home_page_butter_stops",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "product_categories" ADD COLUMN "icon" "enum_product_categories_icon" DEFAULT 'none';
  ALTER TABLE "fat_types" ADD COLUMN "icon" "enum_fat_types_icon" DEFAULT 'none';
  ALTER TABLE "markets" ADD COLUMN "icon" "enum_markets_icon" DEFAULT 'none';
  ALTER TABLE "site_settings" ADD COLUMN "effects_title_rise" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_word_light" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_rolling_numbers" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_showroom" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_foil_cards" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_bento" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_sticky_chapters" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_kinetic_cta" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_footer_name" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_sheet_stack" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_travelling_butter" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "sizes_eyebrow" varchar;
  ALTER TABLE "home_page" ADD COLUMN "sizes_title" varchar;
  ALTER TABLE "home_page" ADD COLUMN "sizes_text" varchar;
  ALTER TABLE "home_page" ADD COLUMN "sizes_enabled" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "sizes_bulk_label" varchar;
  ALTER TABLE "home_page" ADD COLUMN "sizes_bulk_text" varchar;
  ALTER TABLE "home_page" ADD COLUMN "sizes_single_label" varchar;
  ALTER TABLE "home_page" ADD COLUMN "sizes_single_text" varchar;
  ALTER TABLE "home_page" ADD COLUMN "finder_eyebrow" varchar;
  ALTER TABLE "home_page" ADD COLUMN "finder_title" varchar;
  ALTER TABLE "home_page" ADD COLUMN "finder_text" varchar;
  ALTER TABLE "home_page" ADD COLUMN "finder_enabled" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "finder_empty_text" varchar;
  ALTER TABLE "home_page" ADD COLUMN "finder_cta_label" varchar;
  ALTER TABLE "home_page" ADD COLUMN "finder_cta_href" varchar;
  ALTER TABLE "home_page" ADD COLUMN "table_butter_dish" numeric;
  ALTER TABLE "home_page" ADD COLUMN "distribution_route_enabled" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "trust_big_word" varchar;
  ALTER TABLE "home_page_distribution_steps" ADD CONSTRAINT "home_page_distribution_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_butter_stops" ADD CONSTRAINT "home_page_butter_stops_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_distribution_steps_order_idx" ON "home_page_distribution_steps" USING btree ("_order");
  CREATE INDEX "home_page_distribution_steps_parent_id_idx" ON "home_page_distribution_steps" USING btree ("_parent_id");
  CREATE INDEX "home_page_butter_stops_order_idx" ON "home_page_butter_stops" USING btree ("order");
  CREATE INDEX "home_page_butter_stops_parent_idx" ON "home_page_butter_stops" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_page_distribution_steps" CASCADE;
  DROP TABLE "home_page_butter_stops" CASCADE;
  ALTER TABLE "home_page_trust_items" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "home_page_trust_items" ALTER COLUMN "icon" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum_home_page_trust_items_icon";
  CREATE TYPE "public"."enum_home_page_trust_items_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  ALTER TABLE "home_page_trust_items" ALTER COLUMN "icon" SET DEFAULT 'none'::"public"."enum_home_page_trust_items_icon";
  ALTER TABLE "home_page_trust_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_home_page_trust_items_icon" USING "icon"::"public"."enum_home_page_trust_items_icon";
  ALTER TABLE "about_page_values" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "about_page_values" ALTER COLUMN "icon" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum_about_page_values_icon";
  CREATE TYPE "public"."enum_about_page_values_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  ALTER TABLE "about_page_values" ALTER COLUMN "icon" SET DEFAULT 'none'::"public"."enum_about_page_values_icon";
  ALTER TABLE "about_page_values" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_about_page_values_icon" USING "icon"::"public"."enum_about_page_values_icon";
  ALTER TABLE "network_page_steps" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "network_page_steps" ALTER COLUMN "icon" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum_network_page_steps_icon";
  CREATE TYPE "public"."enum_network_page_steps_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  ALTER TABLE "network_page_steps" ALTER COLUMN "icon" SET DEFAULT 'none'::"public"."enum_network_page_steps_icon";
  ALTER TABLE "network_page_steps" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_network_page_steps_icon" USING "icon"::"public"."enum_network_page_steps_icon";
  ALTER TABLE "representation_page_requirements" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "representation_page_requirements" ALTER COLUMN "icon" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum_representation_page_requirements_icon";
  CREATE TYPE "public"."enum_representation_page_requirements_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  ALTER TABLE "representation_page_requirements" ALTER COLUMN "icon" SET DEFAULT 'none'::"public"."enum_representation_page_requirements_icon";
  ALTER TABLE "representation_page_requirements" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_representation_page_requirements_icon" USING "icon"::"public"."enum_representation_page_requirements_icon";
  ALTER TABLE "representation_page_process" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "representation_page_process" ALTER COLUMN "icon" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum_representation_page_process_icon";
  CREATE TYPE "public"."enum_representation_page_process_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  ALTER TABLE "representation_page_process" ALTER COLUMN "icon" SET DEFAULT 'none'::"public"."enum_representation_page_process_icon";
  ALTER TABLE "representation_page_process" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_representation_page_process_icon" USING "icon"::"public"."enum_representation_page_process_icon";
  ALTER TABLE "partnership_page_audiences" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "partnership_page_audiences" ALTER COLUMN "icon" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum_partnership_page_audiences_icon";
  CREATE TYPE "public"."enum_partnership_page_audiences_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  ALTER TABLE "partnership_page_audiences" ALTER COLUMN "icon" SET DEFAULT 'none'::"public"."enum_partnership_page_audiences_icon";
  ALTER TABLE "partnership_page_audiences" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_partnership_page_audiences_icon" USING "icon"::"public"."enum_partnership_page_audiences_icon";
  ALTER TABLE "partnership_page_benefits" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "partnership_page_benefits" ALTER COLUMN "icon" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum_partnership_page_benefits_icon";
  CREATE TYPE "public"."enum_partnership_page_benefits_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  ALTER TABLE "partnership_page_benefits" ALTER COLUMN "icon" SET DEFAULT 'none'::"public"."enum_partnership_page_benefits_icon";
  ALTER TABLE "partnership_page_benefits" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_partnership_page_benefits_icon" USING "icon"::"public"."enum_partnership_page_benefits_icon";
  ALTER TABLE "product_categories" DROP COLUMN "icon";
  ALTER TABLE "fat_types" DROP COLUMN "icon";
  ALTER TABLE "markets" DROP COLUMN "icon";
  ALTER TABLE "site_settings" DROP COLUMN "effects_title_rise";
  ALTER TABLE "site_settings" DROP COLUMN "effects_word_light";
  ALTER TABLE "site_settings" DROP COLUMN "effects_rolling_numbers";
  ALTER TABLE "site_settings" DROP COLUMN "effects_showroom";
  ALTER TABLE "site_settings" DROP COLUMN "effects_foil_cards";
  ALTER TABLE "site_settings" DROP COLUMN "effects_bento";
  ALTER TABLE "site_settings" DROP COLUMN "effects_sticky_chapters";
  ALTER TABLE "site_settings" DROP COLUMN "effects_kinetic_cta";
  ALTER TABLE "site_settings" DROP COLUMN "effects_footer_name";
  ALTER TABLE "site_settings" DROP COLUMN "effects_sheet_stack";
  ALTER TABLE "site_settings" DROP COLUMN "effects_travelling_butter";
  ALTER TABLE "home_page" DROP COLUMN "sizes_eyebrow";
  ALTER TABLE "home_page" DROP COLUMN "sizes_title";
  ALTER TABLE "home_page" DROP COLUMN "sizes_text";
  ALTER TABLE "home_page" DROP COLUMN "sizes_enabled";
  ALTER TABLE "home_page" DROP COLUMN "sizes_bulk_label";
  ALTER TABLE "home_page" DROP COLUMN "sizes_bulk_text";
  ALTER TABLE "home_page" DROP COLUMN "sizes_single_label";
  ALTER TABLE "home_page" DROP COLUMN "sizes_single_text";
  ALTER TABLE "home_page" DROP COLUMN "finder_eyebrow";
  ALTER TABLE "home_page" DROP COLUMN "finder_title";
  ALTER TABLE "home_page" DROP COLUMN "finder_text";
  ALTER TABLE "home_page" DROP COLUMN "finder_enabled";
  ALTER TABLE "home_page" DROP COLUMN "finder_empty_text";
  ALTER TABLE "home_page" DROP COLUMN "finder_cta_label";
  ALTER TABLE "home_page" DROP COLUMN "finder_cta_href";
  ALTER TABLE "home_page" DROP COLUMN "table_butter_dish";
  ALTER TABLE "home_page" DROP COLUMN "distribution_route_enabled";
  ALTER TABLE "home_page" DROP COLUMN "trust_big_word";
  DROP TYPE "public"."enum_product_categories_icon";
  DROP TYPE "public"."enum_fat_types_icon";
  DROP TYPE "public"."enum_markets_icon";
  DROP TYPE "public"."enum_home_page_distribution_steps_icon";
  DROP TYPE "public"."enum_home_page_butter_stops";`)
}
