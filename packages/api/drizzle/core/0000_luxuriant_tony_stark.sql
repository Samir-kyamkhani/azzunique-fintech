CREATE TYPE "public"."verification_status" AS ENUM('PENDING', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."commission_type" AS ENUM('FIXED', 'PERCENTAGE');--> statement-breakpoint
CREATE TYPE "public"."surcharge_type" AS ENUM('FIXED', 'PERCENTAGE');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."effact" AS ENUM('ALLOW', 'DENY');--> statement-breakpoint
CREATE TYPE "public"."document_side" AS ENUM('FRONT', 'BACK', 'SINGLE');--> statement-breakpoint
CREATE TYPE "public"."owner_type" AS ENUM('TENANT', 'USER');--> statement-breakpoint
CREATE TYPE "public"."ledger_entry_type" AS ENUM('DEBIT', 'CREDIT');--> statement-breakpoint
CREATE TYPE "public"."consent_source" AS ENUM('WEB', 'MOBILE');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('PENDING', 'SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."role_commission_type" AS ENUM('FLAT', 'PERCENTAGE');--> statement-breakpoint
CREATE TYPE "public"."role_gst_on_type" AS ENUM('COMMISSION', 'SURCHARGE', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."server_detail_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."tenant_type" AS ENUM('PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('AZZUNIQUE', 'RESELLER', 'WHITELABEL');--> statement-breakpoint
CREATE TYPE "public"."tenant_domains_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."user_commission_type" AS ENUM('FLAT', 'PERCENTAGE');--> statement-breakpoint
CREATE TYPE "public"."user_gst_on_type" AS ENUM('COMMISSION', 'SURCHARGE', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."wallet_owner_type" AS ENUM('USER', 'TENANT');--> statement-breakpoint
CREATE TYPE "public"."wallet_status" AS ENUM('ACTIVE', 'BLOCKED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."wallet_type" AS ENUM('PRIMARY', 'COMMISSION', 'SURCHARGE', 'GST', 'HOLDING');--> statement-breakpoint
CREATE SEQUENCE "public"."employee_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."tenant_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."txn_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."user_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entityId" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"performByUserId" uuid NOT NULL,
	"performByEmployeeId" uuid,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"tenantId" uuid NOT NULL,
	"meta_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants_bank_detail" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"account_holder_name" varchar(255) NOT NULL,
	"account_number" varchar(255) NOT NULL,
	"ifsc_code" varchar(255) NOT NULL,
	"branch_name" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"bank_proof_document_url" varchar(500) NOT NULL,
	"verificationStatus" "verification_status" DEFAULT 'PENDING' NOT NULL,
	"owner_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"submitted_by_employee_id" uuid,
	"verified_by_user_id" uuid NOT NULL,
	"verified_by_employee_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"platform_service_id" uuid NOT NULL,
	"platform_service_feature_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"commission_type" "commission_type" NOT NULL,
	"commission_value" integer NOT NULL,
	"commission_amount" integer NOT NULL,
	"surcharge_type" "surcharge_type" NOT NULL,
	"surcharge_value" integer NOT NULL,
	"surcharge_amount" integer NOT NULL,
	"gross_amount" integer NOT NULL,
	"gst_amount" integer NOT NULL,
	"net_amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_code" varchar(50) NOT NULL,
	"department_name" varchar(100) NOT NULL,
	"department_description" varchar(255),
	"created_by_user_id" uuid,
	"created_by_employee_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departments_department_code_unique" UNIQUE("department_code")
);
--> statement-breakpoint
CREATE TABLE "department_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_number" varchar(30) DEFAULT 'EMP-' || nextval('employee_number_seq') NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified_at" varchar(255),
	"mobile_number" varchar(20) NOT NULL,
	"profile_picture" varchar(255),
	"password_hash" varchar(255) NOT NULL,
	"employeeStatus" "employee_status" NOT NULL,
	"department_id" uuid NOT NULL,
	"refresh_token_hash" varchar(255),
	"password_reset_token_hash" varchar(255),
	"password_reset_token_expiry" timestamp,
	"action_reason" varchar(500),
	"actioned_at" timestamp,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_employee_number_unique" UNIQUE("employee_number"),
	CONSTRAINT "employees_email_unique" UNIQUE("email"),
	CONSTRAINT "employees_mobile_number_unique" UNIQUE("mobile_number"),
	CONSTRAINT "employees_department_id_unique" UNIQUE("department_id")
);
--> statement-breakpoint
CREATE TABLE "employee_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"effact" "effact" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerType" "owner_type" NOT NULL,
	"owner_id" uuid NOT NULL,
	"document_type" varchar(255) NOT NULL,
	"documentSide" "document_side" NOT NULL,
	"document_url" varchar(500) NOT NULL,
	"document_number" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledgers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"walletId" uuid NOT NULL,
	"transactionId" uuid,
	"refundId" uuid,
	"entry_type" "ledger_entry_type" NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"balance_after" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pii_consent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"tenantId" uuid NOT NULL,
	"purpose" varchar(255) NOT NULL,
	"consent_given" boolean NOT NULL,
	"consent_source" "consent_source" NOT NULL,
	"consent_version" varchar(50) NOT NULL,
	"consent_at" timestamp NOT NULL,
	"expire_at" timestamp,
	"consent_revoked_at" timestamp,
	"consent_revoked_reason" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_services_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "platform_service_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"platformServiceId" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_service_features_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transactionId" uuid,
	"tenantId" uuid NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"status" "refund_status" DEFAULT 'PENDING' NOT NULL,
	"initiatedByUserId" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_code" varchar(50) NOT NULL,
	"role_name" varchar(100) NOT NULL,
	"role_description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_role_code_unique" UNIQUE("role_code")
);
--> statement-breakpoint
CREATE TABLE "role_commission_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"platform_service_id" uuid NOT NULL,
	"platform_service_feature_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"commissionType" "role_commission_type" NOT NULL,
	"commission_value" integer NOT NULL,
	"surchargeType" "role_commission_type" NOT NULL,
	"surcharge_value" integer NOT NULL,
	"gst_applicable" boolean DEFAULT false NOT NULL,
	"gst_rate" integer DEFAULT 18 NOT NULL,
	"gstOn" "role_gst_on_type" NOT NULL,
	"gst_inclusive" boolean DEFAULT false NOT NULL,
	"max_commission_value" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "server_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_type" varchar(50) NOT NULL,
	"hostname" varchar(255) NOT NULL,
	"value" varchar(45) NOT NULL,
	"status" "server_detail_status" NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_employee_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platformServiceId" uuid NOT NULL,
	"code" varchar(40) NOT NULL,
	"provider_name" varchar(100) NOT NULL,
	"handler" varchar(200) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_providers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "service_provider_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serviceProviderId" uuid NOT NULL,
	"platformServiceFeatureId" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants_smtp_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"smtp_host" varchar(255) NOT NULL,
	"smtp_port" varchar(10) NOT NULL,
	"smtp_username" varchar(255) NOT NULL,
	"smtp_password" varchar(255) NOT NULL,
	"encryption_type" varchar(50),
	"from_name" varchar(255) NOT NULL,
	"from_email" varchar(255) NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_employee_id" uuid,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_number" varchar(30) DEFAULT 'TEN-' || nextval('tenant_number_seq') NOT NULL,
	"tenant_name" varchar(255) NOT NULL,
	"tenant_legal_name" varchar(255) NOT NULL,
	"tenantType" "tenant_type" NOT NULL,
	"userType" "user_type" NOT NULL,
	"tenant_email" varchar(255) NOT NULL,
	"tenant_whatsapp" varchar(20) NOT NULL,
	"parent_tenant_id" uuid,
	"created_by_employee_id" uuid,
	"tenantStatus" "tenant_status" NOT NULL,
	"tenant_mobile_number" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_tenant_number_unique" UNIQUE("tenant_number"),
	CONSTRAINT "tenants_tenant_email_unique" UNIQUE("tenant_email"),
	CONSTRAINT "tenants_tenant_whatsapp_unique" UNIQUE("tenant_whatsapp")
);
--> statement-breakpoint
CREATE TABLE "tenants_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"domain_name" varchar(255) NOT NULL,
	"status" "tenant_domains_status" NOT NULL,
	"created_by_employee_id" uuid,
	"created_by_user_id" uuid NOT NULL,
	"server_detail_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_domains_domain_name_unique" UNIQUE("domain_name")
);
--> statement-breakpoint
CREATE TABLE "tenants_kyc" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"verificationStatus" "verification_status" DEFAULT 'PENDING' NOT NULL,
	"submitted_by_user_id" uuid,
	"verified_by_user_id" uuid NOT NULL,
	"verified_by_employee_id" uuid,
	"actioned_at" timestamp,
	"action_reason" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_title" varchar(255) NOT NULL,
	"page_content" varchar(5000),
	"page_url" varchar(255) NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_by_employee_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_pages_page_url_unique" UNIQUE("page_url")
);
--> statement-breakpoint
CREATE TABLE "tenants_seo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meta_title" varchar(255) NOT NULL,
	"meta_description" varchar(1000),
	"meta_keywords" varchar(500),
	"is_indexed" boolean DEFAULT true NOT NULL,
	"is_followed" boolean DEFAULT true NOT NULL,
	"tenant_page_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenantId" uuid NOT NULL,
	"platformServiceId" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_service_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenantId" uuid NOT NULL,
	"platformServiceId" uuid NOT NULL,
	"serviceProviderId" uuid NOT NULL,
	"config" jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants_social_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facebook_url" varchar(1000),
	"twitter_url" varchar(1000),
	"instagram_url" varchar(1000),
	"linkedin_url" varchar(1000),
	"youtube_url" varchar(1000),
	"tenant_website_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants_websites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_name" varchar(255) NOT NULL,
	"tag_line" varchar(500),
	"logo_url" varchar(1000),
	"fav_icon_url" varchar(1000),
	"primary_color" varchar(7),
	"secondary_color" varchar(7),
	"support_email" varchar(255),
	"support_phone" varchar(20),
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenantId" uuid NOT NULL,
	"platformServiceId" uuid NOT NULL,
	"platformServiceFeatureId" uuid,
	"reference_id" varchar(40) DEFAULT 
    'TXN-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('txn_seq')::text, 6, '0')
   NOT NULL,
	"provider_reference_id" varchar(40),
	"balance" integer DEFAULT 0 NOT NULL,
	"status" "transaction_status" DEFAULT 'INITIATED' NOT NULL,
	"failure_reason" varchar(500),
	"idempotency_key" varchar(100) NOT NULL,
	"initiatedByUserId" uuid NOT NULL,
	"meta_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_provider_reference_id_unique" UNIQUE("provider_reference_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_number" varchar(30) DEFAULT 'USER-' || nextval('user_number_seq') NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified_at" varchar(255),
	"mobile_number" varchar(20) NOT NULL,
	"profile_picture" varchar(255),
	"password_hash" varchar(255) NOT NULL,
	"transaction_pin_hash" varchar(255),
	"userStatus" "user_status" NOT NULL,
	"is_kyc_verified" varchar(5) DEFAULT 'false' NOT NULL,
	"role_id" uuid NOT NULL,
	"refresh_token_hash" varchar(255),
	"password_reset_token_hash" varchar(255),
	"password_reset_token_expiry" timestamp,
	"action_reason" varchar(500),
	"actioned_at" timestamp,
	"deleted_at" timestamp,
	"parent_id" uuid,
	"created_by_employee_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_user_number_unique" UNIQUE("user_number"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_mobile_number_unique" UNIQUE("mobile_number"),
	CONSTRAINT "users_role_id_unique" UNIQUE("role_id")
);
--> statement-breakpoint
CREATE TABLE "user_commission_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"platform_service_id" uuid NOT NULL,
	"platform_service_feature_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"commissionType" "user_commission_type" NOT NULL,
	"commission_value" integer NOT NULL,
	"surchargeType" "user_commission_type" NOT NULL,
	"surcharge_value" integer NOT NULL,
	"gst_applicable" boolean DEFAULT false NOT NULL,
	"gst_rate" integer DEFAULT 18 NOT NULL,
	"gstOn" "user_gst_on_type" NOT NULL,
	"gst_inclusive" boolean DEFAULT false NOT NULL,
	"max_commission_value" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_kyc" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"verificationStatus" "verification_status" DEFAULT 'PENDING' NOT NULL,
	"submitted_by_user_id" uuid,
	"verified_by_user_id" uuid NOT NULL,
	"verified_by_employee_id" uuid,
	"actioned_at" timestamp,
	"action_reason" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"effact" "effact" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenantId" uuid NOT NULL,
	"ownerType" "wallet_owner_type" NOT NULL,
	"ownerId" uuid NOT NULL,
	"wallet_type" "wallet_type" NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"status" "wallet_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_performByUserId_users_id_fk" FOREIGN KEY ("performByUserId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_bank_detail" ADD CONSTRAINT "tenants_bank_detail_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_bank_detail" ADD CONSTRAINT "tenants_bank_detail_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_bank_detail" ADD CONSTRAINT "tenants_bank_detail_verified_by_user_id_users_id_fk" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_earnings" ADD CONSTRAINT "commission_earnings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_earnings" ADD CONSTRAINT "commission_earnings_platform_service_id_platform_services_id_fk" FOREIGN KEY ("platform_service_id") REFERENCES "public"."platform_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_earnings" ADD CONSTRAINT "commission_earnings_platform_service_feature_id_platform_service_features_id_fk" FOREIGN KEY ("platform_service_feature_id") REFERENCES "public"."platform_service_features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_earnings" ADD CONSTRAINT "commission_earnings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_earnings" ADD CONSTRAINT "commission_earnings_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_earnings" ADD CONSTRAINT "commission_earnings_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_created_by_employee_id_users_id_fk" FOREIGN KEY ("created_by_employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_permissions" ADD CONSTRAINT "department_permissions_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_permissions" ADD CONSTRAINT "department_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_permissions" ADD CONSTRAINT "employee_permissions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_permissions" ADD CONSTRAINT "employee_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_walletId_wallets_id_fk" FOREIGN KEY ("walletId") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_refundId_refunds_id_fk" FOREIGN KEY ("refundId") REFERENCES "public"."refunds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pii_consent" ADD CONSTRAINT "pii_consent_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pii_consent" ADD CONSTRAINT "pii_consent_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_service_features" ADD CONSTRAINT "platform_service_features_platformServiceId_platform_services_id_fk" FOREIGN KEY ("platformServiceId") REFERENCES "public"."platform_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_initiatedByUserId_users_id_fk" FOREIGN KEY ("initiatedByUserId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_commission_settings" ADD CONSTRAINT "role_commission_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_commission_settings" ADD CONSTRAINT "role_commission_settings_platform_service_id_platform_services_id_fk" FOREIGN KEY ("platform_service_id") REFERENCES "public"."platform_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_commission_settings" ADD CONSTRAINT "role_commission_settings_platform_service_feature_id_platform_service_features_id_fk" FOREIGN KEY ("platform_service_feature_id") REFERENCES "public"."platform_service_features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_commission_settings" ADD CONSTRAINT "role_commission_settings_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_details" ADD CONSTRAINT "server_details_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_platformServiceId_platform_services_id_fk" FOREIGN KEY ("platformServiceId") REFERENCES "public"."platform_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_provider_features" ADD CONSTRAINT "service_provider_features_serviceProviderId_service_providers_id_fk" FOREIGN KEY ("serviceProviderId") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_provider_features" ADD CONSTRAINT "service_provider_features_platformServiceFeatureId_platform_service_features_id_fk" FOREIGN KEY ("platformServiceFeatureId") REFERENCES "public"."platform_service_features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_smtp_config" ADD CONSTRAINT "tenants_smtp_config_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_smtp_config" ADD CONSTRAINT "tenants_smtp_config_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_parent_tenant_id_tenants_id_fk" FOREIGN KEY ("parent_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_domains" ADD CONSTRAINT "tenants_domains_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_domains" ADD CONSTRAINT "tenants_domains_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_domains" ADD CONSTRAINT "tenants_domains_server_detail_id_server_details_id_fk" FOREIGN KEY ("server_detail_id") REFERENCES "public"."server_details"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_kyc" ADD CONSTRAINT "tenants_kyc_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_kyc" ADD CONSTRAINT "tenants_kyc_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_kyc" ADD CONSTRAINT "tenants_kyc_verified_by_user_id_users_id_fk" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_pages" ADD CONSTRAINT "tenants_pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_pages" ADD CONSTRAINT "tenants_pages_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_seo" ADD CONSTRAINT "tenants_seo_tenant_page_id_tenants_pages_id_fk" FOREIGN KEY ("tenant_page_id") REFERENCES "public"."tenants_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_services" ADD CONSTRAINT "tenant_services_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_services" ADD CONSTRAINT "tenant_services_platformServiceId_platform_services_id_fk" FOREIGN KEY ("platformServiceId") REFERENCES "public"."platform_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_service_providers" ADD CONSTRAINT "tenant_service_providers_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_service_providers" ADD CONSTRAINT "tenant_service_providers_platformServiceId_platform_services_id_fk" FOREIGN KEY ("platformServiceId") REFERENCES "public"."platform_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_service_providers" ADD CONSTRAINT "tenant_service_providers_serviceProviderId_service_providers_id_fk" FOREIGN KEY ("serviceProviderId") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_social_media" ADD CONSTRAINT "tenants_social_media_tenant_website_id_tenants_websites_id_fk" FOREIGN KEY ("tenant_website_id") REFERENCES "public"."tenants_websites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants_websites" ADD CONSTRAINT "tenants_websites_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_initiatedByUserId_users_id_fk" FOREIGN KEY ("initiatedByUserId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_commission_settings" ADD CONSTRAINT "user_commission_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_commission_settings" ADD CONSTRAINT "user_commission_settings_platform_service_id_platform_services_id_fk" FOREIGN KEY ("platform_service_id") REFERENCES "public"."platform_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_commission_settings" ADD CONSTRAINT "user_commission_settings_platform_service_feature_id_platform_service_features_id_fk" FOREIGN KEY ("platform_service_feature_id") REFERENCES "public"."platform_service_features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_commission_settings" ADD CONSTRAINT "user_commission_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_kyc" ADD CONSTRAINT "users_kyc_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_kyc" ADD CONSTRAINT "users_kyc_verified_by_user_id_users_id_fk" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;