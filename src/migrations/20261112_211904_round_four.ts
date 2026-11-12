import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_holidays_look" AS ENUM('yalda', 'nowruz', 'gold');
  CREATE TYPE "public"."enum_site_settings_holidays_from_month" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TYPE "public"."enum_site_settings_holidays_to_month" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12');
  CREATE TABLE "site_settings_holidays" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"greeting" varchar NOT NULL,
  	"look" "enum_site_settings_holidays_look" DEFAULT 'gold',
  	"from_month" "enum_site_settings_holidays_from_month" NOT NULL,
  	"from_day" numeric NOT NULL,
  	"to_month" "enum_site_settings_holidays_to_month" NOT NULL,
  	"to_day" numeric NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  CREATE TABLE "home_page_kitchen_day_scenes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"market_id" integer,
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  CREATE TABLE "faq_chat_topics_follow_ups_deeper" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  CREATE TABLE "faq_chat_topics_follow_ups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  CREATE TABLE "faq_chat_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  CREATE TABLE "faq_chat" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"on_home" boolean DEFAULT true,
  	"on_network" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"title" varchar,
  	"text" varchar,
  	"greeting" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "products" ADD COLUMN "calculator_per_plate" numeric;
  ALTER TABLE "products" ADD COLUMN "calculator_grams_per_plate" numeric;
  ALTER TABLE "products" ADD COLUMN "calculator_packs_per_carton" numeric;
  ALTER TABLE "products" ADD COLUMN "calculator_package_kg" numeric;
  ALTER TABLE "products" ADD COLUMN "pack_view" boolean DEFAULT true;
  ALTER TABLE "_products_v" ADD COLUMN "version_calculator_per_plate" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_calculator_grams_per_plate" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_calculator_packs_per_carton" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_calculator_package_kg" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_pack_view" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "needs_calculator" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_noosh_jan" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_gold_cursor" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_molten_buttons" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_section_map" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_stretchy_titles" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "holidays_enabled" boolean DEFAULT true;
  ALTER TABLE "ui_texts" ADD COLUMN "errors_not_found_toy" varchar DEFAULT 'تا صفحه را پیدا کنیم، کمی کره روی برنج بکشید.';
  ALTER TABLE "ui_texts" ADD COLUMN "chat_log" varchar DEFAULT 'گفت‌وگوی پرسش و پاسخ';
  ALTER TABLE "ui_texts" ADD COLUMN "chat_ask" varchar DEFAULT 'بپرسید';
  ALTER TABLE "ui_texts" ADD COLUMN "chat_topics" varchar DEFAULT 'پرسش‌های اصلی';
  ALTER TABLE "ui_texts" ADD COLUMN "chat_restart" varchar DEFAULT 'از اول';
  ALTER TABLE "ui_texts" ADD COLUMN "chat_typing" varchar DEFAULT 'در حال نوشتن…';
  ALTER TABLE "ui_texts" ADD COLUMN "chat_you" varchar DEFAULT 'شما';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_product" varchar DEFAULT 'کدام کره؟';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_plates" varchar DEFAULT 'چند بشقاب در روز؟';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_days" varchar DEFAULT 'چند روز در ماه کار می‌کنید؟';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_per_day" varchar DEFAULT 'در روز';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_per_month" varchar DEFAULT 'در ماه';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_packs" varchar DEFAULT 'بسته';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_cartons" varchar DEFAULT 'کارتن';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_kilos" varchar DEFAULT 'کیلوگرم';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_packages" varchar DEFAULT 'بستهٔ فله‌ای';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_plate_unit" varchar DEFAULT 'بشقاب';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_day_unit" varchar DEFAULT 'روز';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_note" varchar DEFAULT 'این فقط یک برآورد است؛ نیاز دقیق را کارشناسان ما با شما بررسی می‌کنند.';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_send" varchar DEFAULT 'این برآورد را برای ما بفرستید';
  ALTER TABLE "ui_texts" ADD COLUMN "calculator_message_intro" varchar DEFAULT 'برآورد نیاز من';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_pack_title" varchar DEFAULT 'یک بستهٔ تک‌نفره، از نزدیک';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_pack_lid" varchar DEFAULT 'درِ فویلی';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_pack_butter" varchar DEFAULT 'کره';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_pack_tray" varchar DEFAULT 'ظرف فرم‌سیل';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_peel_title" varchar DEFAULT 'درِ فویلی را باز کنید';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_peel_hint" varchar DEFAULT 'بکشید';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_peel_done" varchar DEFAULT 'نوش جان!';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_rice_title" varchar DEFAULT 'حالا نوبت شماست';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_rice_hint" varchar DEFAULT 'کره را روی برنج بکشید';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_rice_done" varchar DEFAULT 'نوش جان!';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_rice_progress" varchar DEFAULT 'کره‌ای شده';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_again" varchar DEFAULT 'دوباره';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_play" varchar DEFAULT 'پخش';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_pause" varchar DEFAULT 'توقف';
  ALTER TABLE "ui_texts" ADD COLUMN "touches_cursor_view" varchar DEFAULT 'ببینید';
  ALTER TABLE "ui_texts" ADD COLUMN "touches_cursor_drag" varchar DEFAULT 'بکشید';
  ALTER TABLE "ui_texts" ADD COLUMN "touches_map_label" varchar DEFAULT 'بخش‌های این صفحه';
  ALTER TABLE "ui_texts" ADD COLUMN "touches_map_start" varchar DEFAULT 'آغاز';
  ALTER TABLE "ui_texts" ADD COLUMN "touches_holiday_close" varchar DEFAULT 'بستن تبریک';
  ALTER TABLE "home_page" ADD COLUMN "sizes_pack_enabled" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "sizes_pack_title" varchar;
  ALTER TABLE "home_page" ADD COLUMN "kitchen_day_eyebrow" varchar;
  ALTER TABLE "home_page" ADD COLUMN "kitchen_day_title" varchar;
  ALTER TABLE "home_page" ADD COLUMN "kitchen_day_text" varchar;
  ALTER TABLE "home_page" ADD COLUMN "kitchen_day_enabled" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "kitchen_day_seconds" numeric DEFAULT 21;
  ALTER TABLE "home_page" ADD COLUMN "table_noosh_jan" varchar;
  ALTER TABLE "home_page" ADD COLUMN "table_toy_enabled" boolean DEFAULT true;
  ALTER TABLE "home_page" ADD COLUMN "table_toy_title" varchar;
  ALTER TABLE "home_page" ADD COLUMN "table_toy_hint" varchar;
  ALTER TABLE "home_page" ADD COLUMN "table_toy_done_text" varchar;
  ALTER TABLE "partnership_page" ADD COLUMN "calculator_eyebrow" varchar;
  ALTER TABLE "partnership_page" ADD COLUMN "calculator_title" varchar;
  ALTER TABLE "partnership_page" ADD COLUMN "calculator_text" varchar;
  ALTER TABLE "site_settings_holidays" ADD CONSTRAINT "site_settings_holidays_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_kitchen_day_scenes" ADD CONSTRAINT "home_page_kitchen_day_scenes_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_kitchen_day_scenes" ADD CONSTRAINT "home_page_kitchen_day_scenes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_chat_topics_follow_ups_deeper" ADD CONSTRAINT "faq_chat_topics_follow_ups_deeper_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_chat_topics_follow_ups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_chat_topics_follow_ups" ADD CONSTRAINT "faq_chat_topics_follow_ups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_chat_topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_chat_topics" ADD CONSTRAINT "faq_chat_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_chat"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_holidays_order_idx" ON "site_settings_holidays" USING btree ("_order");
  CREATE INDEX "site_settings_holidays_parent_id_idx" ON "site_settings_holidays" USING btree ("_parent_id");
  CREATE INDEX "home_page_kitchen_day_scenes_order_idx" ON "home_page_kitchen_day_scenes" USING btree ("_order");
  CREATE INDEX "home_page_kitchen_day_scenes_parent_id_idx" ON "home_page_kitchen_day_scenes" USING btree ("_parent_id");
  CREATE INDEX "home_page_kitchen_day_scenes_market_idx" ON "home_page_kitchen_day_scenes" USING btree ("market_id");
  CREATE INDEX "faq_chat_topics_follow_ups_deeper_order_idx" ON "faq_chat_topics_follow_ups_deeper" USING btree ("_order");
  CREATE INDEX "faq_chat_topics_follow_ups_deeper_parent_id_idx" ON "faq_chat_topics_follow_ups_deeper" USING btree ("_parent_id");
  CREATE INDEX "faq_chat_topics_follow_ups_order_idx" ON "faq_chat_topics_follow_ups" USING btree ("_order");
  CREATE INDEX "faq_chat_topics_follow_ups_parent_id_idx" ON "faq_chat_topics_follow_ups" USING btree ("_parent_id");
  CREATE INDEX "faq_chat_topics_order_idx" ON "faq_chat_topics" USING btree ("_order");
  CREATE INDEX "faq_chat_topics_parent_id_idx" ON "faq_chat_topics" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_holidays" CASCADE;
  DROP TABLE "home_page_kitchen_day_scenes" CASCADE;
  DROP TABLE "faq_chat_topics_follow_ups_deeper" CASCADE;
  DROP TABLE "faq_chat_topics_follow_ups" CASCADE;
  DROP TABLE "faq_chat_topics" CASCADE;
  DROP TABLE "faq_chat" CASCADE;
  ALTER TABLE "products" DROP COLUMN "calculator_per_plate";
  ALTER TABLE "products" DROP COLUMN "calculator_grams_per_plate";
  ALTER TABLE "products" DROP COLUMN "calculator_packs_per_carton";
  ALTER TABLE "products" DROP COLUMN "calculator_package_kg";
  ALTER TABLE "products" DROP COLUMN "pack_view";
  ALTER TABLE "_products_v" DROP COLUMN "version_calculator_per_plate";
  ALTER TABLE "_products_v" DROP COLUMN "version_calculator_grams_per_plate";
  ALTER TABLE "_products_v" DROP COLUMN "version_calculator_packs_per_carton";
  ALTER TABLE "_products_v" DROP COLUMN "version_calculator_package_kg";
  ALTER TABLE "_products_v" DROP COLUMN "version_pack_view";
  ALTER TABLE "site_settings" DROP COLUMN "needs_calculator";
  ALTER TABLE "site_settings" DROP COLUMN "effects_noosh_jan";
  ALTER TABLE "site_settings" DROP COLUMN "effects_gold_cursor";
  ALTER TABLE "site_settings" DROP COLUMN "effects_molten_buttons";
  ALTER TABLE "site_settings" DROP COLUMN "effects_section_map";
  ALTER TABLE "site_settings" DROP COLUMN "effects_stretchy_titles";
  ALTER TABLE "site_settings" DROP COLUMN "holidays_enabled";
  ALTER TABLE "ui_texts" DROP COLUMN "errors_not_found_toy";
  ALTER TABLE "ui_texts" DROP COLUMN "chat_log";
  ALTER TABLE "ui_texts" DROP COLUMN "chat_ask";
  ALTER TABLE "ui_texts" DROP COLUMN "chat_topics";
  ALTER TABLE "ui_texts" DROP COLUMN "chat_restart";
  ALTER TABLE "ui_texts" DROP COLUMN "chat_typing";
  ALTER TABLE "ui_texts" DROP COLUMN "chat_you";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_product";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_plates";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_days";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_per_day";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_per_month";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_packs";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_cartons";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_kilos";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_packages";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_plate_unit";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_day_unit";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_note";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_send";
  ALTER TABLE "ui_texts" DROP COLUMN "calculator_message_intro";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_pack_title";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_pack_lid";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_pack_butter";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_pack_tray";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_peel_title";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_peel_hint";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_peel_done";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_rice_title";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_rice_hint";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_rice_done";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_rice_progress";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_again";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_play";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_pause";
  ALTER TABLE "ui_texts" DROP COLUMN "touches_cursor_view";
  ALTER TABLE "ui_texts" DROP COLUMN "touches_cursor_drag";
  ALTER TABLE "ui_texts" DROP COLUMN "touches_map_label";
  ALTER TABLE "ui_texts" DROP COLUMN "touches_map_start";
  ALTER TABLE "ui_texts" DROP COLUMN "touches_holiday_close";
  ALTER TABLE "home_page" DROP COLUMN "sizes_pack_enabled";
  ALTER TABLE "home_page" DROP COLUMN "sizes_pack_title";
  ALTER TABLE "home_page" DROP COLUMN "kitchen_day_eyebrow";
  ALTER TABLE "home_page" DROP COLUMN "kitchen_day_title";
  ALTER TABLE "home_page" DROP COLUMN "kitchen_day_text";
  ALTER TABLE "home_page" DROP COLUMN "kitchen_day_enabled";
  ALTER TABLE "home_page" DROP COLUMN "kitchen_day_seconds";
  ALTER TABLE "home_page" DROP COLUMN "table_noosh_jan";
  ALTER TABLE "home_page" DROP COLUMN "table_toy_enabled";
  ALTER TABLE "home_page" DROP COLUMN "table_toy_title";
  ALTER TABLE "home_page" DROP COLUMN "table_toy_hint";
  ALTER TABLE "home_page" DROP COLUMN "table_toy_done_text";
  ALTER TABLE "partnership_page" DROP COLUMN "calculator_eyebrow";
  ALTER TABLE "partnership_page" DROP COLUMN "calculator_title";
  ALTER TABLE "partnership_page" DROP COLUMN "calculator_text";
  DROP TYPE "public"."enum_site_settings_holidays_look";
  DROP TYPE "public"."enum_site_settings_holidays_from_month";
  DROP TYPE "public"."enum_site_settings_holidays_to_month";`)
}
