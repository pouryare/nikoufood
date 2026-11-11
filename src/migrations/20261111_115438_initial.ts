import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_brands_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__brands_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_leads_type" AS ENUM('representative', 'partnership', 'contact');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'contacted', 'reviewing', 'approved', 'rejected');
  CREATE TYPE "public"."enum_provinces_coverage" AS ENUM('direct', 'covered', 'open', 'soon');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_site_settings_articles_visibility" AS ENUM('auto', 'show', 'hide');
  CREATE TYPE "public"."enum_home_page_film_scenes_layout" AS ENUM('single', 'split');
  CREATE TYPE "public"."enum_home_page_film_scenes_single_art" AS ENUM('none', 'farm', 'seed', 'milk', 'oil', 'cream', 'butter', 'table');
  CREATE TYPE "public"."enum_home_page_film_scenes_plant_art" AS ENUM('none', 'farm', 'seed', 'milk', 'oil', 'cream', 'butter', 'table');
  CREATE TYPE "public"."enum_home_page_film_scenes_animal_art" AS ENUM('none', 'farm', 'seed', 'milk', 'oil', 'cream', 'butter', 'table');
  CREATE TYPE "public"."enum_home_page_trust_items_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  CREATE TYPE "public"."enum_about_page_values_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  CREATE TYPE "public"."enum_network_page_steps_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  CREATE TYPE "public"."enum_representation_page_requirements_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  CREATE TYPE "public"."enum_representation_page_process_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  CREATE TYPE "public"."enum_partnership_page_audiences_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  CREATE TYPE "public"."enum_partnership_page_benefits_icon" AS ENUM('none', 'award', 'truck', 'shield', 'headset', 'users', 'building', 'box', 'layers', 'leaf', 'drop', 'map', 'utensils', 'chat', 'check');
  CREATE TABLE "products_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"weight" varchar,
  	"packaging" varchar
  );
  
  CREATE TABLE "products_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "products_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"order" numeric DEFAULT 100,
  	"brand_id" integer,
  	"category_id" integer,
  	"fat_type_id" integer,
  	"featured" boolean DEFAULT false,
  	"short_description" varchar,
  	"description" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"markets_id" integer
  );
  
  CREATE TABLE "_products_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"weight" varchar,
  	"packaging" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_applications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 100,
  	"version_brand_id" integer,
  	"version_category_id" integer,
  	"version_fat_type_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_short_description" varchar,
  	"version_description" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"markets_id" integer
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"order" numeric DEFAULT 100,
  	"tagline" varchar,
  	"description" varchar,
  	"story" jsonb,
  	"logo_id" integer,
  	"hero_image_id" integer,
  	"brand_color" varchar,
  	"featured" boolean DEFAULT true,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_brands_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_brands_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 100,
  	"version_tagline" varchar,
  	"version_description" varchar,
  	"version_story" jsonb,
  	"version_logo_id" integer,
  	"version_hero_image_id" integer,
  	"version_brand_color" varchar,
  	"version_featured" boolean DEFAULT true,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__brands_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "product_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 100,
  	"description" varchar,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "fat_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 100,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "markets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 100,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_leads_type" NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"full_name" varchar NOT NULL,
  	"mobile" varchar NOT NULL,
  	"phone" varchar,
  	"province_id" integer,
  	"city" varchar,
  	"company" varchar,
  	"business_type" varchar,
  	"email" varchar,
  	"message" varchar,
  	"admin_notes" varchar,
  	"source_page" varchar,
  	"ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "representatives" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"province_id" integer NOT NULL,
  	"city" varchar,
  	"mobile" varchar,
  	"internal_notes" varchar,
  	"application_id" integer,
  	"show_publicly" boolean DEFAULT false,
  	"public_name" varchar,
  	"public_phone" varchar,
  	"public_address" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "provinces" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"coverage" "enum_provinces_coverage" DEFAULT 'open' NOT NULL,
  	"public_note" varchar,
  	"lat" numeric,
  	"lng" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"cover_image_id" integer,
  	"excerpt" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_cover_image_id" integer,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "fonts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"family" varchar NOT NULL,
  	"weight" varchar DEFAULT '400',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"brands_id" integer,
  	"product_categories_id" integer,
  	"fat_types_id" integer,
  	"markets_id" integer,
  	"leads_id" integer,
  	"representatives_id" integer,
  	"provinces_id" integer,
  	"articles_id" integer,
  	"media_id" integer,
  	"fonts_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_trust_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name" varchar DEFAULT 'نیکو اعتماد' NOT NULL,
  	"brand_name_latin" varchar DEFAULT 'NIKOU',
  	"legal_name" varchar DEFAULT 'شرکت نیکو اعتماد پارس پیام',
  	"tagline" varchar,
  	"description" varchar,
  	"logo_mark_id" integer,
  	"use_uploaded_logo" boolean DEFAULT false,
  	"logo_wordmark_id" integer,
  	"latin_tagline" varchar DEFAULT 'Trading & Manufacturing',
  	"default_product_image_id" integer,
  	"default_share_image_id" integer,
  	"years_of_experience" numeric DEFAULT 15,
  	"rebrand_year" varchar DEFAULT '۱۴۰۴',
  	"phone" varchar,
  	"whatsapp_number" varchar,
  	"email" varchar,
  	"address" varchar,
  	"working_hours" varchar,
  	"map_lat" numeric,
  	"map_lng" numeric,
  	"telegram_url" varchar,
  	"bale_url" varchar,
  	"eitaa_url" varchar,
  	"instagram_url" varchar,
  	"notify_emails" varchar,
  	"notify_from" varchar,
  	"articles_visibility" "enum_site_settings_articles_visibility" DEFAULT 'auto',
  	"enable3d" boolean DEFAULT true,
  	"show_whatsapp_button" boolean DEFAULT true,
  	"footer_text" varchar,
  	"copyright" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "theme" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"colors_background" varchar DEFAULT '#070b16',
  	"colors_surface" varchar DEFAULT '#0e1526',
  	"colors_surface_raised" varchar DEFAULT '#151f38',
  	"colors_text_primary" varchar DEFAULT '#f4eee0',
  	"colors_text_secondary" varchar DEFAULT '#a9b1c6',
  	"colors_border" varchar DEFAULT '#24304d',
  	"colors_primary" varchar DEFAULT '#e3b04b',
  	"colors_secondary" varchar DEFAULT '#f2e3b3',
  	"colors_accent" varchar DEFAULT '#8572ef',
  	"colors_logo_from" varchar DEFAULT '#15d3df',
  	"colors_logo_to" varchar DEFAULT '#f412ff',
  	"colors_success" varchar DEFAULT '#3fb68b',
  	"colors_error" varchar DEFAULT '#f0616d',
  	"fonts_body_font_id" integer,
  	"fonts_body_font_bold_id" integer,
  	"fonts_display_font_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_cta_label" varchar,
  	"header_cta_href" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ui_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"common_home" varchar DEFAULT 'خانه',
  	"common_skip_to_content" varchar DEFAULT 'رفتن به محتوای اصلی',
  	"common_menu" varchar DEFAULT 'منو',
  	"common_close" varchar DEFAULT 'بستن',
  	"common_all" varchar DEFAULT 'همه',
  	"common_view_all" varchar DEFAULT 'مشاهدهٔ همه',
  	"common_learn_more" varchar DEFAULT 'بیشتر بدانید',
  	"common_scroll_hint" varchar DEFAULT 'برای دیدن داستان، اسکرول کنید',
  	"common_coming_soon" varchar DEFAULT 'به‌زودی',
  	"products_view" varchar DEFAULT 'مشاهدهٔ محصول',
  	"products_brand" varchar DEFAULT 'برند',
  	"products_category" varchar DEFAULT 'دسته‌بندی',
  	"products_type" varchar DEFAULT 'نوع',
  	"products_weight" varchar DEFAULT 'وزن',
  	"products_packaging" varchar DEFAULT 'بسته‌بندی',
  	"products_variants" varchar DEFAULT 'وزن‌ها و بسته‌بندی‌ها',
  	"products_features" varchar DEFAULT 'ویژگی‌ها',
  	"products_specs" varchar DEFAULT 'مشخصات',
  	"products_applications" varchar DEFAULT 'کاربردها',
  	"products_markets" varchar DEFAULT 'مناسب برای',
  	"products_related" varchar DEFAULT 'محصولات دیگر',
  	"products_empty" varchar DEFAULT 'محصولی با این مشخصات پیدا نشد.',
  	"products_clear_filters" varchar DEFAULT 'حذف فیلترها',
  	"products_image_soon" varchar DEFAULT 'تصویر محصول به‌زودی',
  	"products_brand_products" varchar DEFAULT 'محصولات این برند',
  	"products_view_brand" varchar DEFAULT 'آشنایی با برند',
  	"products_filters_label" varchar DEFAULT 'فیلتر محصولات',
  	"products_count_label" varchar DEFAULT 'محصول',
  	"network_direct" varchar DEFAULT 'پخش مستقیم',
  	"network_covered" varchar DEFAULT 'تحت پوشش نماینده',
  	"network_open" varchar DEFAULT 'پذیرش درخواست نمایندگی',
  	"network_soon" varchar DEFAULT 'به‌زودی',
  	"network_select_province" varchar DEFAULT 'یک استان را انتخاب کنید',
  	"network_apply_for_province" varchar DEFAULT 'درخواست نمایندگی در این استان',
  	"network_province_list" varchar DEFAULT 'فهرست استان‌ها',
  	"network_representatives" varchar DEFAULT 'نمایندگان این استان',
  	"network_hub" varchar DEFAULT 'مرکز پخش',
  	"network_map_hint" varchar DEFAULT 'برای دیدن وضعیت هر استان، روی آن بروید یا لمس کنید.',
  	"network_map_label" varchar DEFAULT 'نقشهٔ پوشش استان‌های ایران',
  	"network_direct_by" varchar DEFAULT 'پخش مستقیم توسط',
  	"network_sister_company" varchar DEFAULT 'شرکت هم‌گروه نیکو اعتماد',
  	"network_visit_website" varchar DEFAULT 'مشاهدهٔ وب‌سایت',
  	"forms_full_name" varchar DEFAULT 'نام و نام خانوادگی',
  	"forms_mobile" varchar DEFAULT 'شماره موبایل',
  	"forms_phone" varchar DEFAULT 'شماره تلفن ثابت',
  	"forms_province" varchar DEFAULT 'استان',
  	"forms_province_placeholder" varchar DEFAULT 'انتخاب استان',
  	"forms_company" varchar DEFAULT 'نام شرکت یا کسب‌وکار',
  	"forms_business_type" varchar DEFAULT 'نوع کسب‌وکار',
  	"forms_business_type_placeholder" varchar DEFAULT 'انتخاب کنید',
  	"forms_email" varchar DEFAULT 'ایمیل',
  	"forms_message" varchar DEFAULT 'پیام',
  	"forms_optional" varchar DEFAULT 'اختیاری',
  	"forms_sending" varchar DEFAULT 'در حال ارسال…',
  	"forms_send_another" varchar DEFAULT 'ثبت درخواست دیگر',
  	"forms_fix_errors" varchar DEFAULT 'لطفاً موارد مشخص‌شده را اصلاح کنید.',
  	"contact_phone" varchar DEFAULT 'تلفن',
  	"contact_whatsapp" varchar DEFAULT 'واتساپ',
  	"contact_telegram" varchar DEFAULT 'تلگرام',
  	"contact_bale" varchar DEFAULT 'بله',
  	"contact_eitaa" varchar DEFAULT 'ایتا',
  	"contact_instagram" varchar DEFAULT 'اینستاگرام',
  	"contact_email" varchar DEFAULT 'ایمیل',
  	"contact_address" varchar DEFAULT 'نشانی',
  	"contact_hours" varchar DEFAULT 'ساعت کاری',
  	"contact_messengers" varchar DEFAULT 'پیام‌رسان‌ها',
  	"contact_dock_label" varchar DEFAULT 'راه‌های ارتباطی',
  	"contact_show_on_map" varchar DEFAULT 'نمایش روی نقشه',
  	"contact_head_office" varchar DEFAULT 'دفتر مرکزی',
  	"articles_read_more" varchar DEFAULT 'ادامهٔ مطلب',
  	"articles_empty" varchar DEFAULT 'هنوز مطلبی منتشر نشده است.',
  	"articles_back_to_list" varchar DEFAULT 'بازگشت به مقالات',
  	"errors_not_found_title" varchar DEFAULT 'صفحه پیدا نشد',
  	"errors_not_found_text" varchar DEFAULT 'صفحه‌ای که دنبالش بودید وجود ندارد یا جابه‌جا شده است.',
  	"errors_back_home" varchar DEFAULT 'بازگشت به صفحهٔ اصلی',
  	"errors_error_title" varchar DEFAULT 'مشکلی پیش آمد',
  	"errors_error_text" varchar DEFAULT 'لطفاً چند لحظهٔ دیگر دوباره تلاش کنید.',
  	"errors_retry" varchar DEFAULT 'تلاش دوباره',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_film_scenes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_home_page_film_scenes_layout" DEFAULT 'single' NOT NULL,
  	"kicker" varchar NOT NULL,
  	"single_title" varchar,
  	"single_text" varchar,
  	"single_image_id" integer,
  	"single_image_mobile_id" integer,
  	"single_video_id" integer,
  	"single_art" "enum_home_page_film_scenes_single_art" DEFAULT 'none',
  	"plant_title" varchar,
  	"plant_text" varchar,
  	"plant_image_id" integer,
  	"plant_image_mobile_id" integer,
  	"plant_video_id" integer,
  	"plant_art" "enum_home_page_film_scenes_plant_art" DEFAULT 'none',
  	"animal_title" varchar,
  	"animal_text" varchar,
  	"animal_image_id" integer,
  	"animal_image_mobile_id" integer,
  	"animal_video_id" integer,
  	"animal_art" "enum_home_page_film_scenes_animal_art" DEFAULT 'none'
  );
  
  CREATE TABLE "home_page_intro_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_trust_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"icon" "enum_home_page_trust_items_icon" DEFAULT 'none'
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_word_top" varchar,
  	"hero_word_middle" varchar,
  	"hero_word_bottom" varchar,
  	"hero_subtitle" varchar,
  	"hero_primary_cta_label" varchar,
  	"hero_primary_cta_href" varchar,
  	"hero_secondary_cta_label" varchar,
  	"hero_secondary_cta_href" varchar,
  	"hero_image_id" integer,
  	"film_enabled" boolean DEFAULT true,
  	"film_eyebrow" varchar,
  	"film_title" varchar,
  	"film_intro" varchar,
  	"film_plant_label" varchar,
  	"film_animal_label" varchar,
  	"film_video_id" integer,
  	"film_video_mobile_id" integer,
  	"intro_eyebrow" varchar,
  	"intro_title" varchar,
  	"intro_text" varchar,
  	"intro_cta_label" varchar,
  	"intro_cta_href" varchar,
  	"products_eyebrow" varchar,
  	"products_title" varchar,
  	"products_text" varchar,
  	"products_cta_label" varchar,
  	"products_show_markets" boolean DEFAULT true,
  	"brands_eyebrow" varchar,
  	"brands_title" varchar,
  	"brands_text" varchar,
  	"distribution_eyebrow" varchar,
  	"distribution_title" varchar,
  	"distribution_text" varchar,
  	"distribution_tehran_title" varchar,
  	"distribution_tehran_text" varchar,
  	"distribution_provinces_title" varchar,
  	"distribution_provinces_text" varchar,
  	"map_eyebrow" varchar,
  	"map_title" varchar,
  	"map_text" varchar,
  	"map_cta_label" varchar,
  	"trust_eyebrow" varchar,
  	"trust_title" varchar,
  	"trust_text" varchar,
  	"final_cta_title" varchar,
  	"final_cta_text" varchar,
  	"final_cta_primary_label" varchar,
  	"final_cta_primary_href" varchar,
  	"final_cta_secondary_label" varchar,
  	"final_cta_secondary_href" varchar,
  	"final_cta_tertiary_label" varchar,
  	"final_cta_tertiary_href" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "about_page_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "about_page_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"icon" "enum_about_page_values_icon" DEFAULT 'none'
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_eyebrow" varchar,
  	"header_title" varchar NOT NULL,
  	"header_intro" varchar,
  	"vision_title" varchar,
  	"vision_text" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_primary_label" varchar,
  	"cta_primary_href" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "network_page_legend" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "network_page_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"icon" "enum_network_page_steps_icon" DEFAULT 'none'
  );
  
  CREATE TABLE "network_page_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "network_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_eyebrow" varchar,
  	"header_title" varchar NOT NULL,
  	"header_intro" varchar,
  	"tehran_title" varchar,
  	"tehran_text" varchar,
  	"tehran_partner_name" varchar DEFAULT 'طعمینو',
  	"tehran_partner_logo_id" integer,
  	"tehran_partner_url" varchar,
  	"provinces_title" varchar,
  	"provinces_text" varchar,
  	"map_eyebrow" varchar,
  	"map_title" varchar,
  	"map_text" varchar,
  	"steps_title" varchar,
  	"faq_title" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_label" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "representation_page_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"icon" "enum_representation_page_requirements_icon" DEFAULT 'none'
  );
  
  CREATE TABLE "representation_page_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"icon" "enum_representation_page_process_icon" DEFAULT 'none'
  );
  
  CREATE TABLE "representation_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_eyebrow" varchar,
  	"header_title" varchar NOT NULL,
  	"header_intro" varchar,
  	"form_title" varchar,
  	"form_intro" varchar,
  	"form_submit_label" varchar,
  	"form_success_title" varchar,
  	"form_success_message" varchar,
  	"form_privacy_note" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "partnership_page_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"icon" "enum_partnership_page_audiences_icon" DEFAULT 'none'
  );
  
  CREATE TABLE "partnership_page_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"icon" "enum_partnership_page_benefits_icon" DEFAULT 'none'
  );
  
  CREATE TABLE "partnership_page_business_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "partnership_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_eyebrow" varchar,
  	"header_title" varchar NOT NULL,
  	"header_intro" varchar,
  	"form_title" varchar,
  	"form_intro" varchar,
  	"form_submit_label" varchar,
  	"form_success_title" varchar,
  	"form_success_message" varchar,
  	"form_privacy_note" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_eyebrow" varchar,
  	"header_title" varchar NOT NULL,
  	"header_intro" varchar,
  	"form_title" varchar,
  	"form_intro" varchar,
  	"form_submit_label" varchar,
  	"form_success_title" varchar,
  	"form_success_message" varchar,
  	"form_privacy_note" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "listing_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"products_header_eyebrow" varchar,
  	"products_header_title" varchar NOT NULL,
  	"products_header_intro" varchar,
  	"brands_header_eyebrow" varchar,
  	"brands_header_title" varchar NOT NULL,
  	"brands_header_intro" varchar,
  	"articles_header_eyebrow" varchar,
  	"articles_header_title" varchar NOT NULL,
  	"articles_header_intro" varchar,
  	"product_cta_title" varchar,
  	"product_cta_text" varchar,
  	"product_cta_primary_label" varchar,
  	"product_cta_primary_href" varchar,
  	"product_cta_secondary_label" varchar,
  	"product_cta_secondary_href" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_features" ADD CONSTRAINT "products_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specs" ADD CONSTRAINT "products_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_applications" ADD CONSTRAINT "products_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_fat_type_id_fat_types_id_fk" FOREIGN KEY ("fat_type_id") REFERENCES "public"."fat_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_variants" ADD CONSTRAINT "_products_v_version_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_features" ADD CONSTRAINT "_products_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_specs" ADD CONSTRAINT "_products_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_applications" ADD CONSTRAINT "_products_v_version_applications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_category_id_product_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_fat_type_id_fat_types_id_fk" FOREIGN KEY ("version_fat_type_id") REFERENCES "public"."fat_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_parent_id_brands_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "representatives" ADD CONSTRAINT "representatives_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "representatives" ADD CONSTRAINT "representatives_application_id_leads_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fat_types_fk" FOREIGN KEY ("fat_types_id") REFERENCES "public"."fat_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_representatives_fk" FOREIGN KEY ("representatives_id") REFERENCES "public"."representatives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_provinces_fk" FOREIGN KEY ("provinces_id") REFERENCES "public"."provinces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fonts_fk" FOREIGN KEY ("fonts_id") REFERENCES "public"."fonts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_trust_badges" ADD CONSTRAINT "site_settings_trust_badges_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_trust_badges" ADD CONSTRAINT "site_settings_trust_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_mark_id_media_id_fk" FOREIGN KEY ("logo_mark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_wordmark_id_media_id_fk" FOREIGN KEY ("logo_wordmark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_product_image_id_media_id_fk" FOREIGN KEY ("default_product_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_share_image_id_media_id_fk" FOREIGN KEY ("default_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "theme" ADD CONSTRAINT "theme_fonts_body_font_id_fonts_id_fk" FOREIGN KEY ("fonts_body_font_id") REFERENCES "public"."fonts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "theme" ADD CONSTRAINT "theme_fonts_body_font_bold_id_fonts_id_fk" FOREIGN KEY ("fonts_body_font_bold_id") REFERENCES "public"."fonts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "theme" ADD CONSTRAINT "theme_fonts_display_font_id_fonts_id_fk" FOREIGN KEY ("fonts_display_font_id") REFERENCES "public"."fonts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header" ADD CONSTRAINT "navigation_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns" ADD CONSTRAINT "navigation_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_single_image_id_media_id_fk" FOREIGN KEY ("single_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_single_image_mobile_id_media_id_fk" FOREIGN KEY ("single_image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_single_video_id_media_id_fk" FOREIGN KEY ("single_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_plant_image_id_media_id_fk" FOREIGN KEY ("plant_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_plant_image_mobile_id_media_id_fk" FOREIGN KEY ("plant_image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_plant_video_id_media_id_fk" FOREIGN KEY ("plant_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_animal_image_id_media_id_fk" FOREIGN KEY ("animal_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_animal_image_mobile_id_media_id_fk" FOREIGN KEY ("animal_image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_animal_video_id_media_id_fk" FOREIGN KEY ("animal_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_film_scenes" ADD CONSTRAINT "home_page_film_scenes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_intro_highlights" ADD CONSTRAINT "home_page_intro_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_trust_items" ADD CONSTRAINT "home_page_trust_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_film_video_id_media_id_fk" FOREIGN KEY ("film_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_film_video_mobile_id_media_id_fk" FOREIGN KEY ("film_video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_chapters" ADD CONSTRAINT "about_page_chapters_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_chapters" ADD CONSTRAINT "about_page_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_milestones" ADD CONSTRAINT "about_page_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_values" ADD CONSTRAINT "about_page_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "network_page_legend" ADD CONSTRAINT "network_page_legend_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."network_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "network_page_steps" ADD CONSTRAINT "network_page_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."network_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "network_page_faq" ADD CONSTRAINT "network_page_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."network_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "network_page" ADD CONSTRAINT "network_page_tehran_partner_logo_id_media_id_fk" FOREIGN KEY ("tehran_partner_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "network_page" ADD CONSTRAINT "network_page_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "representation_page_requirements" ADD CONSTRAINT "representation_page_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."representation_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "representation_page_process" ADD CONSTRAINT "representation_page_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."representation_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "representation_page" ADD CONSTRAINT "representation_page_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partnership_page_audiences" ADD CONSTRAINT "partnership_page_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partnership_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partnership_page_benefits" ADD CONSTRAINT "partnership_page_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partnership_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partnership_page_business_types" ADD CONSTRAINT "partnership_page_business_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partnership_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partnership_page" ADD CONSTRAINT "partnership_page_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_page" ADD CONSTRAINT "contact_page_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_images_order_idx" ON "products_images" USING btree ("_order");
  CREATE INDEX "products_images_parent_id_idx" ON "products_images" USING btree ("_parent_id");
  CREATE INDEX "products_images_image_idx" ON "products_images" USING btree ("image_id");
  CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
  CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
  CREATE INDEX "products_features_order_idx" ON "products_features" USING btree ("_order");
  CREATE INDEX "products_features_parent_id_idx" ON "products_features" USING btree ("_parent_id");
  CREATE INDEX "products_specs_order_idx" ON "products_specs" USING btree ("_order");
  CREATE INDEX "products_specs_parent_id_idx" ON "products_specs" USING btree ("_parent_id");
  CREATE INDEX "products_applications_order_idx" ON "products_applications" USING btree ("_order");
  CREATE INDEX "products_applications_parent_id_idx" ON "products_applications" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  CREATE INDEX "products_fat_type_idx" ON "products" USING btree ("fat_type_id");
  CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_markets_id_idx" ON "products_rels" USING btree ("markets_id");
  CREATE INDEX "_products_v_version_images_order_idx" ON "_products_v_version_images" USING btree ("_order");
  CREATE INDEX "_products_v_version_images_parent_id_idx" ON "_products_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_images_image_idx" ON "_products_v_version_images" USING btree ("image_id");
  CREATE INDEX "_products_v_version_variants_order_idx" ON "_products_v_version_variants" USING btree ("_order");
  CREATE INDEX "_products_v_version_variants_parent_id_idx" ON "_products_v_version_variants" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_features_order_idx" ON "_products_v_version_features" USING btree ("_order");
  CREATE INDEX "_products_v_version_features_parent_id_idx" ON "_products_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_specs_order_idx" ON "_products_v_version_specs" USING btree ("_order");
  CREATE INDEX "_products_v_version_specs_parent_id_idx" ON "_products_v_version_specs" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_applications_order_idx" ON "_products_v_version_applications" USING btree ("_order");
  CREATE INDEX "_products_v_version_applications_parent_id_idx" ON "_products_v_version_applications" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_brand_idx" ON "_products_v" USING btree ("version_brand_id");
  CREATE INDEX "_products_v_version_version_category_idx" ON "_products_v" USING btree ("version_category_id");
  CREATE INDEX "_products_v_version_version_fat_type_idx" ON "_products_v" USING btree ("version_fat_type_id");
  CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_markets_id_idx" ON "_products_v_rels" USING btree ("markets_id");
  CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE INDEX "brands_hero_image_idx" ON "brands" USING btree ("hero_image_id");
  CREATE INDEX "brands_meta_meta_image_idx" ON "brands" USING btree ("meta_image_id");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE INDEX "brands__status_idx" ON "brands" USING btree ("_status");
  CREATE INDEX "_brands_v_parent_idx" ON "_brands_v" USING btree ("parent_id");
  CREATE INDEX "_brands_v_version_version_slug_idx" ON "_brands_v" USING btree ("version_slug");
  CREATE INDEX "_brands_v_version_version_logo_idx" ON "_brands_v" USING btree ("version_logo_id");
  CREATE INDEX "_brands_v_version_version_hero_image_idx" ON "_brands_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_brands_v_version_meta_version_meta_image_idx" ON "_brands_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_brands_v_version_version_updated_at_idx" ON "_brands_v" USING btree ("version_updated_at");
  CREATE INDEX "_brands_v_version_version_created_at_idx" ON "_brands_v" USING btree ("version_created_at");
  CREATE INDEX "_brands_v_version_version__status_idx" ON "_brands_v" USING btree ("version__status");
  CREATE INDEX "_brands_v_created_at_idx" ON "_brands_v" USING btree ("created_at");
  CREATE INDEX "_brands_v_updated_at_idx" ON "_brands_v" USING btree ("updated_at");
  CREATE INDEX "_brands_v_latest_idx" ON "_brands_v" USING btree ("latest");
  CREATE UNIQUE INDEX "product_categories_slug_idx" ON "product_categories" USING btree ("slug");
  CREATE INDEX "product_categories_image_idx" ON "product_categories" USING btree ("image_id");
  CREATE INDEX "product_categories_updated_at_idx" ON "product_categories" USING btree ("updated_at");
  CREATE INDEX "product_categories_created_at_idx" ON "product_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "fat_types_slug_idx" ON "fat_types" USING btree ("slug");
  CREATE INDEX "fat_types_updated_at_idx" ON "fat_types" USING btree ("updated_at");
  CREATE INDEX "fat_types_created_at_idx" ON "fat_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "markets_slug_idx" ON "markets" USING btree ("slug");
  CREATE INDEX "markets_updated_at_idx" ON "markets" USING btree ("updated_at");
  CREATE INDEX "markets_created_at_idx" ON "markets" USING btree ("created_at");
  CREATE INDEX "leads_type_idx" ON "leads" USING btree ("type");
  CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");
  CREATE INDEX "leads_mobile_idx" ON "leads" USING btree ("mobile");
  CREATE INDEX "leads_province_idx" ON "leads" USING btree ("province_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "representatives_province_idx" ON "representatives" USING btree ("province_id");
  CREATE INDEX "representatives_application_idx" ON "representatives" USING btree ("application_id");
  CREATE INDEX "representatives_updated_at_idx" ON "representatives" USING btree ("updated_at");
  CREATE INDEX "representatives_created_at_idx" ON "representatives" USING btree ("created_at");
  CREATE UNIQUE INDEX "provinces_slug_idx" ON "provinces" USING btree ("slug");
  CREATE INDEX "provinces_updated_at_idx" ON "provinces" USING btree ("updated_at");
  CREATE INDEX "provinces_created_at_idx" ON "provinces" USING btree ("created_at");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_cover_image_idx" ON "articles" USING btree ("cover_image_id");
  CREATE INDEX "articles_meta_meta_image_idx" ON "articles" USING btree ("meta_image_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_cover_image_idx" ON "_articles_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_articles_v_version_meta_version_meta_image_idx" ON "_articles_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "fonts_updated_at_idx" ON "fonts" USING btree ("updated_at");
  CREATE INDEX "fonts_created_at_idx" ON "fonts" USING btree ("created_at");
  CREATE UNIQUE INDEX "fonts_filename_idx" ON "fonts" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_product_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("product_categories_id");
  CREATE INDEX "payload_locked_documents_rels_fat_types_id_idx" ON "payload_locked_documents_rels" USING btree ("fat_types_id");
  CREATE INDEX "payload_locked_documents_rels_markets_id_idx" ON "payload_locked_documents_rels" USING btree ("markets_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_representatives_id_idx" ON "payload_locked_documents_rels" USING btree ("representatives_id");
  CREATE INDEX "payload_locked_documents_rels_provinces_id_idx" ON "payload_locked_documents_rels" USING btree ("provinces_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_fonts_id_idx" ON "payload_locked_documents_rels" USING btree ("fonts_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_trust_badges_order_idx" ON "site_settings_trust_badges" USING btree ("_order");
  CREATE INDEX "site_settings_trust_badges_parent_id_idx" ON "site_settings_trust_badges" USING btree ("_parent_id");
  CREATE INDEX "site_settings_trust_badges_image_idx" ON "site_settings_trust_badges" USING btree ("image_id");
  CREATE INDEX "site_settings_logo_mark_idx" ON "site_settings" USING btree ("logo_mark_id");
  CREATE INDEX "site_settings_logo_wordmark_idx" ON "site_settings" USING btree ("logo_wordmark_id");
  CREATE INDEX "site_settings_default_product_image_idx" ON "site_settings" USING btree ("default_product_image_id");
  CREATE INDEX "site_settings_default_share_image_idx" ON "site_settings" USING btree ("default_share_image_id");
  CREATE INDEX "theme_fonts_fonts_body_font_idx" ON "theme" USING btree ("fonts_body_font_id");
  CREATE INDEX "theme_fonts_fonts_body_font_bold_idx" ON "theme" USING btree ("fonts_body_font_bold_id");
  CREATE INDEX "theme_fonts_fonts_display_font_idx" ON "theme" USING btree ("fonts_display_font_id");
  CREATE INDEX "navigation_header_order_idx" ON "navigation_header" USING btree ("_order");
  CREATE INDEX "navigation_header_parent_id_idx" ON "navigation_header" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_links_order_idx" ON "navigation_footer_columns_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_links_parent_id_idx" ON "navigation_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_order_idx" ON "navigation_footer_columns" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_parent_id_idx" ON "navigation_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "home_page_film_scenes_order_idx" ON "home_page_film_scenes" USING btree ("_order");
  CREATE INDEX "home_page_film_scenes_parent_id_idx" ON "home_page_film_scenes" USING btree ("_parent_id");
  CREATE INDEX "home_page_film_scenes_single_single_image_idx" ON "home_page_film_scenes" USING btree ("single_image_id");
  CREATE INDEX "home_page_film_scenes_single_single_image_mobile_idx" ON "home_page_film_scenes" USING btree ("single_image_mobile_id");
  CREATE INDEX "home_page_film_scenes_single_single_video_idx" ON "home_page_film_scenes" USING btree ("single_video_id");
  CREATE INDEX "home_page_film_scenes_plant_plant_image_idx" ON "home_page_film_scenes" USING btree ("plant_image_id");
  CREATE INDEX "home_page_film_scenes_plant_plant_image_mobile_idx" ON "home_page_film_scenes" USING btree ("plant_image_mobile_id");
  CREATE INDEX "home_page_film_scenes_plant_plant_video_idx" ON "home_page_film_scenes" USING btree ("plant_video_id");
  CREATE INDEX "home_page_film_scenes_animal_animal_image_idx" ON "home_page_film_scenes" USING btree ("animal_image_id");
  CREATE INDEX "home_page_film_scenes_animal_animal_image_mobile_idx" ON "home_page_film_scenes" USING btree ("animal_image_mobile_id");
  CREATE INDEX "home_page_film_scenes_animal_animal_video_idx" ON "home_page_film_scenes" USING btree ("animal_video_id");
  CREATE INDEX "home_page_intro_highlights_order_idx" ON "home_page_intro_highlights" USING btree ("_order");
  CREATE INDEX "home_page_intro_highlights_parent_id_idx" ON "home_page_intro_highlights" USING btree ("_parent_id");
  CREATE INDEX "home_page_trust_items_order_idx" ON "home_page_trust_items" USING btree ("_order");
  CREATE INDEX "home_page_trust_items_parent_id_idx" ON "home_page_trust_items" USING btree ("_parent_id");
  CREATE INDEX "home_page_hero_hero_image_idx" ON "home_page" USING btree ("hero_image_id");
  CREATE INDEX "home_page_film_film_video_idx" ON "home_page" USING btree ("film_video_id");
  CREATE INDEX "home_page_film_film_video_mobile_idx" ON "home_page" USING btree ("film_video_mobile_id");
  CREATE INDEX "home_page_meta_meta_image_idx" ON "home_page" USING btree ("meta_image_id");
  CREATE INDEX "about_page_chapters_order_idx" ON "about_page_chapters" USING btree ("_order");
  CREATE INDEX "about_page_chapters_parent_id_idx" ON "about_page_chapters" USING btree ("_parent_id");
  CREATE INDEX "about_page_chapters_image_idx" ON "about_page_chapters" USING btree ("image_id");
  CREATE INDEX "about_page_milestones_order_idx" ON "about_page_milestones" USING btree ("_order");
  CREATE INDEX "about_page_milestones_parent_id_idx" ON "about_page_milestones" USING btree ("_parent_id");
  CREATE INDEX "about_page_values_order_idx" ON "about_page_values" USING btree ("_order");
  CREATE INDEX "about_page_values_parent_id_idx" ON "about_page_values" USING btree ("_parent_id");
  CREATE INDEX "about_page_meta_meta_image_idx" ON "about_page" USING btree ("meta_image_id");
  CREATE INDEX "network_page_legend_order_idx" ON "network_page_legend" USING btree ("_order");
  CREATE INDEX "network_page_legend_parent_id_idx" ON "network_page_legend" USING btree ("_parent_id");
  CREATE INDEX "network_page_steps_order_idx" ON "network_page_steps" USING btree ("_order");
  CREATE INDEX "network_page_steps_parent_id_idx" ON "network_page_steps" USING btree ("_parent_id");
  CREATE INDEX "network_page_faq_order_idx" ON "network_page_faq" USING btree ("_order");
  CREATE INDEX "network_page_faq_parent_id_idx" ON "network_page_faq" USING btree ("_parent_id");
  CREATE INDEX "network_page_tehran_tehran_partner_logo_idx" ON "network_page" USING btree ("tehran_partner_logo_id");
  CREATE INDEX "network_page_meta_meta_image_idx" ON "network_page" USING btree ("meta_image_id");
  CREATE INDEX "representation_page_requirements_order_idx" ON "representation_page_requirements" USING btree ("_order");
  CREATE INDEX "representation_page_requirements_parent_id_idx" ON "representation_page_requirements" USING btree ("_parent_id");
  CREATE INDEX "representation_page_process_order_idx" ON "representation_page_process" USING btree ("_order");
  CREATE INDEX "representation_page_process_parent_id_idx" ON "representation_page_process" USING btree ("_parent_id");
  CREATE INDEX "representation_page_meta_meta_image_idx" ON "representation_page" USING btree ("meta_image_id");
  CREATE INDEX "partnership_page_audiences_order_idx" ON "partnership_page_audiences" USING btree ("_order");
  CREATE INDEX "partnership_page_audiences_parent_id_idx" ON "partnership_page_audiences" USING btree ("_parent_id");
  CREATE INDEX "partnership_page_benefits_order_idx" ON "partnership_page_benefits" USING btree ("_order");
  CREATE INDEX "partnership_page_benefits_parent_id_idx" ON "partnership_page_benefits" USING btree ("_parent_id");
  CREATE INDEX "partnership_page_business_types_order_idx" ON "partnership_page_business_types" USING btree ("_order");
  CREATE INDEX "partnership_page_business_types_parent_id_idx" ON "partnership_page_business_types" USING btree ("_parent_id");
  CREATE INDEX "partnership_page_meta_meta_image_idx" ON "partnership_page" USING btree ("meta_image_id");
  CREATE INDEX "contact_page_meta_meta_image_idx" ON "contact_page" USING btree ("meta_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_images" CASCADE;
  DROP TABLE "products_variants" CASCADE;
  DROP TABLE "products_features" CASCADE;
  DROP TABLE "products_specs" CASCADE;
  DROP TABLE "products_applications" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_images" CASCADE;
  DROP TABLE "_products_v_version_variants" CASCADE;
  DROP TABLE "_products_v_version_features" CASCADE;
  DROP TABLE "_products_v_version_specs" CASCADE;
  DROP TABLE "_products_v_version_applications" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "_brands_v" CASCADE;
  DROP TABLE "product_categories" CASCADE;
  DROP TABLE "fat_types" CASCADE;
  DROP TABLE "markets" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "representatives" CASCADE;
  DROP TABLE "provinces" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "fonts" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_trust_badges" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "theme" CASCADE;
  DROP TABLE "navigation_header" CASCADE;
  DROP TABLE "navigation_footer_columns_links" CASCADE;
  DROP TABLE "navigation_footer_columns" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "ui_texts" CASCADE;
  DROP TABLE "home_page_film_scenes" CASCADE;
  DROP TABLE "home_page_intro_highlights" CASCADE;
  DROP TABLE "home_page_trust_items" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "about_page_chapters" CASCADE;
  DROP TABLE "about_page_milestones" CASCADE;
  DROP TABLE "about_page_values" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "network_page_legend" CASCADE;
  DROP TABLE "network_page_steps" CASCADE;
  DROP TABLE "network_page_faq" CASCADE;
  DROP TABLE "network_page" CASCADE;
  DROP TABLE "representation_page_requirements" CASCADE;
  DROP TABLE "representation_page_process" CASCADE;
  DROP TABLE "representation_page" CASCADE;
  DROP TABLE "partnership_page_audiences" CASCADE;
  DROP TABLE "partnership_page_benefits" CASCADE;
  DROP TABLE "partnership_page_business_types" CASCADE;
  DROP TABLE "partnership_page" CASCADE;
  DROP TABLE "contact_page" CASCADE;
  DROP TABLE "listing_pages" CASCADE;
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_brands_status";
  DROP TYPE "public"."enum__brands_v_version_status";
  DROP TYPE "public"."enum_leads_type";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_provinces_coverage";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_site_settings_articles_visibility";
  DROP TYPE "public"."enum_home_page_film_scenes_layout";
  DROP TYPE "public"."enum_home_page_film_scenes_single_art";
  DROP TYPE "public"."enum_home_page_film_scenes_plant_art";
  DROP TYPE "public"."enum_home_page_film_scenes_animal_art";
  DROP TYPE "public"."enum_home_page_trust_items_icon";
  DROP TYPE "public"."enum_about_page_values_icon";
  DROP TYPE "public"."enum_network_page_steps_icon";
  DROP TYPE "public"."enum_representation_page_requirements_icon";
  DROP TYPE "public"."enum_representation_page_process_icon";
  DROP TYPE "public"."enum_partnership_page_audiences_icon";
  DROP TYPE "public"."enum_partnership_page_benefits_icon";`)
}
