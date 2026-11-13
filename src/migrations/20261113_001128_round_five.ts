import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ui_texts" ALTER COLUMN "toys_rice_hint" SET DEFAULT 'با انگشت یا ماوس روی بشقاب بکشید تا کره روی برنج پخش شود';
  ALTER TABLE "site_settings" ADD COLUMN "effects_butter_everywhere" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_music" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_micro_sounds" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "effects_music_volume" numeric DEFAULT 60;
  ALTER TABLE "site_settings" ADD COLUMN "effects_sfx_volume" numeric DEFAULT 70;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_hover_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_tick_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_pop_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_open_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_close_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_success_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_whoosh_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_scrape_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "sounds_peel_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "music_files_hero_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "music_files_melt_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "music_files_film_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "music_files_intro_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "music_files_sizes_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "music_files_products_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "music_files_finder_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "music_files_kitchen_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "music_files_table_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "music_files_network_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "music_files_trust_id" integer;
  ALTER TABLE "ui_texts" ADD COLUMN "toys_rice_step1" varchar DEFAULT 'روی بشقاب بزنید و نگه دارید';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_rice_step2" varchar DEFAULT 'بکشید تا کره روی برنج پخش شود';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_rice_step3" varchar DEFAULT 'وقتی نوار طلایی پر شد، نوش جان!';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_rice_guide" varchar DEFAULT 'از اینجا بکشید';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_rice_start" varchar DEFAULT 'شروع کنید';
  ALTER TABLE "ui_texts" ADD COLUMN "toys_rice_close" varchar DEFAULT 'بستن';
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_hover_id_media_id_fk" FOREIGN KEY ("sounds_hover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_tick_id_media_id_fk" FOREIGN KEY ("sounds_tick_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_pop_id_media_id_fk" FOREIGN KEY ("sounds_pop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_open_id_media_id_fk" FOREIGN KEY ("sounds_open_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_close_id_media_id_fk" FOREIGN KEY ("sounds_close_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_success_id_media_id_fk" FOREIGN KEY ("sounds_success_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_whoosh_id_media_id_fk" FOREIGN KEY ("sounds_whoosh_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_scrape_id_media_id_fk" FOREIGN KEY ("sounds_scrape_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_sounds_peel_id_media_id_fk" FOREIGN KEY ("sounds_peel_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_music_files_hero_id_media_id_fk" FOREIGN KEY ("music_files_hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_music_files_melt_id_media_id_fk" FOREIGN KEY ("music_files_melt_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_music_files_film_id_media_id_fk" FOREIGN KEY ("music_files_film_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_music_files_intro_id_media_id_fk" FOREIGN KEY ("music_files_intro_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_music_files_sizes_id_media_id_fk" FOREIGN KEY ("music_files_sizes_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_music_files_products_id_media_id_fk" FOREIGN KEY ("music_files_products_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_music_files_finder_id_media_id_fk" FOREIGN KEY ("music_files_finder_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_music_files_kitchen_id_media_id_fk" FOREIGN KEY ("music_files_kitchen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_music_files_table_id_media_id_fk" FOREIGN KEY ("music_files_table_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_music_files_network_id_media_id_fk" FOREIGN KEY ("music_files_network_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_music_files_trust_id_media_id_fk" FOREIGN KEY ("music_files_trust_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_sounds_sounds_hover_idx" ON "site_settings" USING btree ("sounds_hover_id");
  CREATE INDEX "site_settings_sounds_sounds_tick_idx" ON "site_settings" USING btree ("sounds_tick_id");
  CREATE INDEX "site_settings_sounds_sounds_pop_idx" ON "site_settings" USING btree ("sounds_pop_id");
  CREATE INDEX "site_settings_sounds_sounds_open_idx" ON "site_settings" USING btree ("sounds_open_id");
  CREATE INDEX "site_settings_sounds_sounds_close_idx" ON "site_settings" USING btree ("sounds_close_id");
  CREATE INDEX "site_settings_sounds_sounds_success_idx" ON "site_settings" USING btree ("sounds_success_id");
  CREATE INDEX "site_settings_sounds_sounds_whoosh_idx" ON "site_settings" USING btree ("sounds_whoosh_id");
  CREATE INDEX "site_settings_sounds_sounds_scrape_idx" ON "site_settings" USING btree ("sounds_scrape_id");
  CREATE INDEX "site_settings_sounds_sounds_peel_idx" ON "site_settings" USING btree ("sounds_peel_id");
  CREATE INDEX "site_settings_music_files_music_files_hero_idx" ON "site_settings" USING btree ("music_files_hero_id");
  CREATE INDEX "site_settings_music_files_music_files_melt_idx" ON "site_settings" USING btree ("music_files_melt_id");
  CREATE INDEX "site_settings_music_files_music_files_film_idx" ON "site_settings" USING btree ("music_files_film_id");
  CREATE INDEX "site_settings_music_files_music_files_intro_idx" ON "site_settings" USING btree ("music_files_intro_id");
  CREATE INDEX "site_settings_music_files_music_files_sizes_idx" ON "site_settings" USING btree ("music_files_sizes_id");
  CREATE INDEX "site_settings_music_files_music_files_products_idx" ON "site_settings" USING btree ("music_files_products_id");
  CREATE INDEX "site_settings_music_files_music_files_finder_idx" ON "site_settings" USING btree ("music_files_finder_id");
  CREATE INDEX "site_settings_music_files_music_files_kitchen_idx" ON "site_settings" USING btree ("music_files_kitchen_id");
  CREATE INDEX "site_settings_music_files_music_files_table_idx" ON "site_settings" USING btree ("music_files_table_id");
  CREATE INDEX "site_settings_music_files_music_files_network_idx" ON "site_settings" USING btree ("music_files_network_id");
  CREATE INDEX "site_settings_music_files_music_files_trust_idx" ON "site_settings" USING btree ("music_files_trust_id");
  -- A saved row still holding the old wording gets the clearer one; a hint an editor has changed stays as it is.
  UPDATE "ui_texts" SET "toys_rice_hint" = 'با انگشت یا ماوس روی بشقاب بکشید تا کره روی برنج پخش شود' WHERE "toys_rice_hint" = 'کره را روی برنج بکشید';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_hover_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_tick_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_pop_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_open_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_close_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_success_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_whoosh_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_scrape_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_sounds_peel_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_music_files_hero_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_music_files_melt_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_music_files_film_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_music_files_intro_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_music_files_sizes_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_music_files_products_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_music_files_finder_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_music_files_kitchen_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_music_files_table_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_music_files_network_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_music_files_trust_id_media_id_fk";
  
  DROP INDEX "site_settings_sounds_sounds_hover_idx";
  DROP INDEX "site_settings_sounds_sounds_tick_idx";
  DROP INDEX "site_settings_sounds_sounds_pop_idx";
  DROP INDEX "site_settings_sounds_sounds_open_idx";
  DROP INDEX "site_settings_sounds_sounds_close_idx";
  DROP INDEX "site_settings_sounds_sounds_success_idx";
  DROP INDEX "site_settings_sounds_sounds_whoosh_idx";
  DROP INDEX "site_settings_sounds_sounds_scrape_idx";
  DROP INDEX "site_settings_sounds_sounds_peel_idx";
  DROP INDEX "site_settings_music_files_music_files_hero_idx";
  DROP INDEX "site_settings_music_files_music_files_melt_idx";
  DROP INDEX "site_settings_music_files_music_files_film_idx";
  DROP INDEX "site_settings_music_files_music_files_intro_idx";
  DROP INDEX "site_settings_music_files_music_files_sizes_idx";
  DROP INDEX "site_settings_music_files_music_files_products_idx";
  DROP INDEX "site_settings_music_files_music_files_finder_idx";
  DROP INDEX "site_settings_music_files_music_files_kitchen_idx";
  DROP INDEX "site_settings_music_files_music_files_table_idx";
  DROP INDEX "site_settings_music_files_music_files_network_idx";
  DROP INDEX "site_settings_music_files_music_files_trust_idx";
  ALTER TABLE "ui_texts" ALTER COLUMN "toys_rice_hint" SET DEFAULT 'کره را روی برنج بکشید';
  ALTER TABLE "site_settings" DROP COLUMN "effects_butter_everywhere";
  ALTER TABLE "site_settings" DROP COLUMN "effects_music";
  ALTER TABLE "site_settings" DROP COLUMN "effects_micro_sounds";
  ALTER TABLE "site_settings" DROP COLUMN "effects_music_volume";
  ALTER TABLE "site_settings" DROP COLUMN "effects_sfx_volume";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_hover_id";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_tick_id";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_pop_id";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_open_id";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_close_id";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_success_id";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_whoosh_id";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_scrape_id";
  ALTER TABLE "site_settings" DROP COLUMN "sounds_peel_id";
  ALTER TABLE "site_settings" DROP COLUMN "music_files_hero_id";
  ALTER TABLE "site_settings" DROP COLUMN "music_files_melt_id";
  ALTER TABLE "site_settings" DROP COLUMN "music_files_film_id";
  ALTER TABLE "site_settings" DROP COLUMN "music_files_intro_id";
  ALTER TABLE "site_settings" DROP COLUMN "music_files_sizes_id";
  ALTER TABLE "site_settings" DROP COLUMN "music_files_products_id";
  ALTER TABLE "site_settings" DROP COLUMN "music_files_finder_id";
  ALTER TABLE "site_settings" DROP COLUMN "music_files_kitchen_id";
  ALTER TABLE "site_settings" DROP COLUMN "music_files_table_id";
  ALTER TABLE "site_settings" DROP COLUMN "music_files_network_id";
  ALTER TABLE "site_settings" DROP COLUMN "music_files_trust_id";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_rice_step1";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_rice_step2";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_rice_step3";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_rice_guide";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_rice_start";
  ALTER TABLE "ui_texts" DROP COLUMN "toys_rice_close";
  UPDATE "ui_texts" SET "toys_rice_hint" = 'کره را روی برنج بکشید' WHERE "toys_rice_hint" = 'با انگشت یا ماوس روی بشقاب بکشید تا کره روی برنج پخش شود';`)
}
