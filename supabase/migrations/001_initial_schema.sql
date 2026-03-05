-- ============================================
-- ConceevHealth Full Database Schema Migration
-- Run this in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================

-- =====================
-- 1. ENUM TYPES
-- =====================
CREATE TYPE "user_role" AS ENUM ('SUPERADMIN', 'ADMIN', 'USER');
CREATE TYPE "lead_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "lead_rating" AS ENUM ('HOT', 'WARM', 'COLD');
CREATE TYPE "appointment_status" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "transaction_type" AS ENUM ('CREDIT', 'DEBIT', 'REFUND');
CREATE TYPE "subscription_status" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'PENDING');
CREATE TYPE "task_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "social_platform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'YOUTUBE', 'GOOGLE', 'TIKTOK');
CREATE TYPE "post_status" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED');

-- =====================
-- 2. USERS & AUTH
-- =====================

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "password" TEXT,
  "phone" TEXT,
  "role" "user_role" NOT NULL DEFAULT 'USER',
  "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "accounts" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refreshToken" TEXT,
  "accessToken" TEXT,
  "expiresAt" INTEGER,
  "tokenType" TEXT,
  "scope" TEXT,
  "idToken" TEXT,
  "sessionState" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

CREATE TABLE "sessions" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

CREATE TABLE "verification_tokens" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_email_token_key" ON "verification_tokens"("email", "token");

CREATE TABLE "password_reset_tokens" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");
CREATE UNIQUE INDEX "password_reset_tokens_email_token_key" ON "password_reset_tokens"("email", "token");

CREATE TABLE "two_factor_tokens" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "two_factor_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "two_factor_tokens_token_key" ON "two_factor_tokens"("token");
CREATE UNIQUE INDEX "two_factor_tokens_email_token_key" ON "two_factor_tokens"("email", "token");

CREATE TABLE "two_factor_confirmations" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "two_factor_confirmations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "two_factor_confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "two_factor_confirmations_userId_key" ON "two_factor_confirmations"("userId");

-- =====================
-- 3. SECTORS (needed before organizations)
-- =====================

CREATE TABLE "sectors" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- =====================
-- 4. ORGANIZATIONS
-- =====================

CREATE TABLE "organizations" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logo" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "website" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zipCode" TEXT,
  "country" TEXT,
  "primaryColor" TEXT,
  "secondaryColor" TEXT,
  "industry" TEXT,
  "size" TEXT,
  "businessCategory" TEXT,
  "businessDescription" TEXT,
  "timeZone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  "gstNumber" TEXT,
  "panNumber" TEXT,
  "interestedServices" TEXT[],
  "primaryObjectives" TEXT[],
  "productAccessTypes" TEXT[],
  "referralSource" TEXT,
  "marketingUpdates" BOOLEAN NOT NULL DEFAULT false,
  "acceptedTerms" BOOLEAN NOT NULL DEFAULT false,
  "watiApiToken" TEXT,
  "watiUrl" TEXT,
  "watiAppointmentTemplate" TEXT,
  "watiAppointmentId" TEXT,
  "razorpayKey" TEXT,
  "razorpaySecret" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sectorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "organizations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "organizations_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE INDEX "organizations_sectorId_idx" ON "organizations"("sectorId");

CREATE TABLE "organization_members" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "isOwner" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "organization_members_userId_organizationId_key" ON "organization_members"("userId", "organizationId");
CREATE INDEX "organization_members_userId_idx" ON "organization_members"("userId");
CREATE INDEX "organization_members_organizationId_idx" ON "organization_members"("organizationId");

-- =====================
-- 5. ROLES & PERMISSIONS
-- =====================

CREATE TABLE "org_roles" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "org_roles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "org_roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "org_roles_organizationId_name_key" ON "org_roles"("organizationId", "name");
CREATE INDEX "org_roles_organizationId_idx" ON "org_roles"("organizationId");

CREATE TABLE "org_permissions" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "org_permissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "org_permissions_code_key" ON "org_permissions"("code");
CREATE INDEX "org_permissions_module_idx" ON "org_permissions"("module");

CREATE TABLE "org_role_permissions" (
  "id" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "org_role_permissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "org_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "org_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "org_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "org_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "org_role_permissions_roleId_permissionId_key" ON "org_role_permissions"("roleId", "permissionId");
CREATE INDEX "org_role_permissions_roleId_idx" ON "org_role_permissions"("roleId");
CREATE INDEX "org_role_permissions_permissionId_idx" ON "org_role_permissions"("permissionId");

CREATE TABLE "org_member_roles" (
  "id" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "org_member_roles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "org_member_roles_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "organization_members"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "org_member_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "org_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "org_member_roles_memberId_roleId_key" ON "org_member_roles"("memberId", "roleId");
CREATE INDEX "org_member_roles_memberId_idx" ON "org_member_roles"("memberId");
CREATE INDEX "org_member_roles_roleId_idx" ON "org_member_roles"("roleId");

-- =====================
-- 6. INVITATIONS
-- =====================

CREATE TABLE "invitations" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "invitationCode" TEXT NOT NULL,
  "invitationLink" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "roleId" TEXT,
  "invitedById" TEXT NOT NULL,
  "acceptedById" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "invitations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "invitations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "invitations_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "invitations_invitationCode_key" ON "invitations"("invitationCode");
CREATE INDEX "invitations_organizationId_idx" ON "invitations"("organizationId");
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- =====================
-- 7. AUDIT LOGS
-- =====================

CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT,
  "changes" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "audit_logs_organizationId_idx" ON "audit_logs"("organizationId");
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- =====================
-- 8. WALLET & PAYMENTS
-- =====================

CREATE TABLE "wallets" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "balance" NUMERIC NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wallets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "wallets_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "wallets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "wallets_organizationId_key" ON "wallets"("organizationId");
CREATE INDEX "wallets_ownerId_idx" ON "wallets"("ownerId");

CREATE TABLE "wallet_transactions" (
  "id" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "type" "transaction_type" NOT NULL,
  "amount" NUMERIC NOT NULL,
  "balanceAfter" NUMERIC NOT NULL,
  "description" TEXT NOT NULL,
  "reference" TEXT,
  "idempotencyKey" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "wallet_transactions_idempotencyKey_key" ON "wallet_transactions"("idempotencyKey");
CREATE INDEX "wallet_transactions_walletId_idx" ON "wallet_transactions"("walletId");
CREATE INDEX "wallet_transactions_createdAt_idx" ON "wallet_transactions"("createdAt");

CREATE TABLE "payment_orders" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "razorpayOrderId" TEXT NOT NULL,
  "razorpayPaymentId" TEXT,
  "razorpaySignature" TEXT,
  "amount" NUMERIC NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" TEXT NOT NULL DEFAULT 'CREATED',
  "purpose" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "payment_orders_razorpayOrderId_key" ON "payment_orders"("razorpayOrderId");
CREATE INDEX "payment_orders_organizationId_idx" ON "payment_orders"("organizationId");
CREATE INDEX "payment_orders_status_idx" ON "payment_orders"("status");

CREATE TABLE "invoices" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "invoiceType" TEXT NOT NULL,
  "amount" NUMERIC NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "razorpayInvoiceId" TEXT,
  "razorpayPaymentId" TEXT,
  "billingPeriodStart" TIMESTAMP(3),
  "billingPeriodEnd" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "items" JSONB,
  "invoicePdfUrl" TEXT,
  "billingName" TEXT,
  "billingEmail" TEXT,
  "billingAddress" TEXT,
  "billingCity" TEXT,
  "billingCountry" TEXT,
  "billingGst" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");
CREATE INDEX "invoices_organizationId_idx" ON "invoices"("organizationId");
CREATE INDEX "invoices_invoiceType_idx" ON "invoices"("invoiceType");
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- =====================
-- 9. PLANS & SUBSCRIPTIONS
-- =====================

CREATE TABLE "plan_services" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "icon" TEXT,
  "type" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "plan_services_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "plan_services_slug_key" ON "plan_services"("slug");

CREATE TABLE "plans" (
  "id" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "price" NUMERIC NOT NULL,
  "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
  "isPopular" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "razorpayPlanId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "plans_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "plans_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "plan_services"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "plans_serviceId_idx" ON "plans"("serviceId");

CREATE TABLE "plan_features" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "featureSlug" TEXT,
  "isIncluded" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "plan_features_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "plan_features_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "plan_features_planId_idx" ON "plan_features"("planId");

CREATE TABLE "subscriptions" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "status" "subscription_status" NOT NULL DEFAULT 'PENDING',
  "razorpaySubscriptionId" TEXT,
  "razorpayCustomerId" TEXT,
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "nextBillingDate" TIMESTAMP(3),
  "activatedAt" TIMESTAMP(3),
  "pausedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "billingName" TEXT,
  "billingEmail" TEXT,
  "billingGst" TEXT,
  "billingAddress" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "subscriptions_organizationId_idx" ON "subscriptions"("organizationId");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- =====================
-- 10. LEADS
-- =====================

CREATE TABLE "lead_statuses" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_statuses_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lead_statuses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "lead_statuses_organizationId_name_key" ON "lead_statuses"("organizationId", "name");
CREATE INDEX "lead_statuses_organizationId_idx" ON "lead_statuses"("organizationId");

CREATE TABLE "lead_sources" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_sources_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lead_sources_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "lead_sources_organizationId_name_key" ON "lead_sources"("organizationId", "name");
CREATE INDEX "lead_sources_organizationId_idx" ON "lead_sources"("organizationId");

CREATE TABLE "leads" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "mobile" TEXT,
  "gender" TEXT,
  "dob" TIMESTAMP(3),
  "company" TEXT,
  "industry" TEXT,
  "annualRevenue" NUMERIC,
  "noOfEmployees" INTEGER,
  "websiteUrl" TEXT,
  "type" TEXT,
  "priority" "lead_priority",
  "rating" "lead_rating",
  "score" INTEGER,
  "statusId" TEXT,
  "sourceId" TEXT,
  "organizationId" TEXT NOT NULL,
  "createdById" TEXT,
  "ownerId" TEXT,
  "socials" JSONB,
  "tagNames" TEXT[],
  "customFields" JSONB,
  "isConverted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "leads_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "lead_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "leads_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "lead_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "leads_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "leads_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "leads_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "leads_organizationId_idx" ON "leads"("organizationId");
CREATE INDEX "leads_statusId_idx" ON "leads"("statusId");
CREATE INDEX "leads_sourceId_idx" ON "leads"("sourceId");
CREATE INDEX "leads_ownerId_idx" ON "leads"("ownerId");
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");
CREATE INDEX "leads_deletedAt_idx" ON "leads"("deletedAt");

CREATE TABLE "lead_activities" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "userId" TEXT,
  "type" TEXT NOT NULL,
  "content" TEXT,
  "changes" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lead_activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lead_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "lead_activities_leadId_idx" ON "lead_activities"("leadId");
CREATE INDEX "lead_activities_userId_idx" ON "lead_activities"("userId");
CREATE INDEX "lead_activities_createdAt_idx" ON "lead_activities"("createdAt");

CREATE TABLE "tags" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tags_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tags_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "tags_organizationId_name_key" ON "tags"("organizationId", "name");
CREATE INDEX "tags_organizationId_idx" ON "tags"("organizationId");

CREATE TABLE "_LeadToTag" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  CONSTRAINT "_LeadToTag_pkey" PRIMARY KEY ("A", "B"),
  CONSTRAINT "_LeadToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "_LeadToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "_LeadToTag_B_index" ON "_LeadToTag"("B");

CREATE TABLE "lead_forms" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "fields" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_forms_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lead_forms_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "lead_forms_organizationId_idx" ON "lead_forms"("organizationId");

CREATE TABLE "lead_form_submissions" (
  "id" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_form_submissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lead_form_submissions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "lead_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "lead_form_submissions_formId_idx" ON "lead_form_submissions"("formId");

CREATE TABLE "lead_views" (
  "id" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "columns" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_views_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lead_views_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "organization_members"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lead_views_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "lead_views_memberId_organizationId_key" ON "lead_views"("memberId", "organizationId");
CREATE INDEX "lead_views_organizationId_idx" ON "lead_views"("organizationId");

CREATE TABLE "export_jobs" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "fileUrl" TEXT,
  "filters" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "export_jobs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "export_jobs_organizationId_idx" ON "export_jobs"("organizationId");
CREATE INDEX "export_jobs_status_idx" ON "export_jobs"("status");

-- =====================
-- 11. APPOINTMENTS
-- =====================

CREATE TABLE "providers" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "image" TEXT,
  "designation" TEXT,
  "bio" TEXT,
  "consultationFee" NUMERIC,
  "consultationDuration" INTEGER,
  "bufferBefore" INTEGER,
  "bufferAfter" INTEGER,
  "workingHours" JSONB,
  "specialWorkingHours" JSONB,
  "unavailability" JSONB,
  "userId" TEXT,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "providers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "providers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "providers_organizationId_idx" ON "providers"("organizationId");
CREATE INDEX "providers_userId_idx" ON "providers"("userId");

CREATE TABLE "locations" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "locations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "locations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "locations_organizationId_idx" ON "locations"("organizationId");

CREATE TABLE "appointment_service_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "duration" INTEGER,
  "price" NUMERIC,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "appointment_service_categories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "appointment_service_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "appointment_service_categories_organizationId_idx" ON "appointment_service_categories"("organizationId");

CREATE TABLE "availabilities" (
  "id" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "providerId" TEXT NOT NULL,
  "locationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "availabilities_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "availabilities_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "availabilities_providerId_idx" ON "availabilities"("providerId");
CREATE INDEX "availabilities_locationId_idx" ON "availabilities"("locationId");

CREATE TABLE "appointments" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "providerId" TEXT,
  "locationId" TEXT,
  "serviceCategoryId" TEXT,
  "leadId" TEXT,
  "status" "appointment_status" NOT NULL DEFAULT 'PENDING',
  "note" TEXT,
  "googleCalendarEventId" TEXT,
  "meetingLink" TEXT,
  "customFields" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "appointments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "appointments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "appointments_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "appointments_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "appointments_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "appointment_service_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "appointments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "appointments_organizationId_idx" ON "appointments"("organizationId");
CREATE INDEX "appointments_providerId_idx" ON "appointments"("providerId");
CREATE INDEX "appointments_locationId_idx" ON "appointments"("locationId");
CREATE INDEX "appointments_leadId_idx" ON "appointments"("leadId");
CREATE INDEX "appointments_startTime_idx" ON "appointments"("startTime");
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- =====================
-- 12. SOCIAL MEDIA
-- =====================

CREATE TABLE "social_connections" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT,
  "platform" "social_platform" NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "pageAccessToken" TEXT,
  "pageId" TEXT,
  "expiresAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "social_connections_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "social_connections_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "social_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "social_connections_organizationId_idx" ON "social_connections"("organizationId");
CREATE INDEX "social_connections_userId_idx" ON "social_connections"("userId");

CREATE TABLE "social_posts" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "platform" "social_platform" NOT NULL,
  "content" TEXT,
  "media" JSONB,
  "status" "post_status" NOT NULL DEFAULT 'DRAFT',
  "scheduledAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "platformPostId" TEXT,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "social_posts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "social_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "social_posts_organizationId_idx" ON "social_posts"("organizationId");
CREATE INDEX "social_posts_userId_idx" ON "social_posts"("userId");
CREATE INDEX "social_posts_status_idx" ON "social_posts"("status");
CREATE INDEX "social_posts_scheduledAt_idx" ON "social_posts"("scheduledAt");

CREATE TABLE "social_automations" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "triggers" JSONB,
  "listener" JSONB,
  "keywords" JSONB,
  "dmCount" INTEGER NOT NULL DEFAULT 0,
  "commentCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "social_automations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "social_automations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "social_automations_organizationId_idx" ON "social_automations"("organizationId");

-- =====================
-- 13. ADS
-- =====================

CREATE TABLE "ad_accounts" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "accessToken" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ad_accounts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ad_accounts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ad_accounts_organizationId_idx" ON "ad_accounts"("organizationId");

CREATE TABLE "ad_campaigns" (
  "id" TEXT NOT NULL,
  "adAccountId" TEXT NOT NULL,
  "externalCampaignId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "dailyBudget" NUMERIC,
  "totalBudget" NUMERIC,
  "totalSpend" NUMERIC,
  "totalImpressions" INTEGER,
  "totalClicks" INTEGER,
  "totalConversions" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ad_campaigns_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ad_campaigns_adAccountId_fkey" FOREIGN KEY ("adAccountId") REFERENCES "ad_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ad_campaigns_adAccountId_idx" ON "ad_campaigns"("adAccountId");

-- =====================
-- 14. NOTIFICATIONS
-- =====================

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'IN_APP',
  "title" TEXT,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "notifications_organizationId_idx" ON "notifications"("organizationId");
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- =====================
-- 15. DASHBOARD CONFIGS
-- =====================

CREATE TABLE "dashboard_configs" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "widgets" JSONB NOT NULL DEFAULT '[]',
  "layouts" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "dashboard_configs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "dashboard_configs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "dashboard_configs_organizationId_idx" ON "dashboard_configs"("organizationId");

-- =====================
-- 16. TASKS & WORKSPACES
-- =====================

CREATE TABLE "workspaces" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isPrivate" BOOLEAN NOT NULL DEFAULT false,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "workspaces_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "workspaces_organizationId_idx" ON "workspaces"("organizationId");

CREATE TABLE "workspace_members" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "isFavorite" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "workspace_members_userId_workspaceId_key" ON "workspace_members"("userId", "workspaceId");
CREATE INDEX "workspace_members_userId_idx" ON "workspace_members"("userId");
CREATE INDEX "workspace_members_workspaceId_idx" ON "workspace_members"("workspaceId");

CREATE TABLE "task_lists" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "task_lists_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "task_lists_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "task_lists_workspaceId_idx" ON "task_lists"("workspaceId");

CREATE TABLE "tasks" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'TODO',
  "priority" "task_priority" NOT NULL DEFAULT 'MEDIUM',
  "startDate" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "listId" TEXT,
  "creatorId" TEXT NOT NULL,
  "assigneeId" TEXT,
  "subtasks" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tasks_listId_fkey" FOREIGN KEY ("listId") REFERENCES "task_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "tasks_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "tasks_listId_idx" ON "tasks"("listId");
CREATE INDEX "tasks_creatorId_idx" ON "tasks"("creatorId");
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");

CREATE TABLE "task_comments" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "task_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "task_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "task_comments_taskId_idx" ON "task_comments"("taskId");
CREATE INDEX "task_comments_authorId_idx" ON "task_comments"("authorId");

-- =====================
-- 17. SERVICE CATALOG
-- =====================

CREATE TABLE "service_catalog_categories" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "service_catalog_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "service_catalog_categories_key_key" ON "service_catalog_categories"("key");

CREATE TABLE "service_catalog_items" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "shortDescription" TEXT NOT NULL,
  "detailedDescription" TEXT NOT NULL,
  "deliverables" TEXT[],
  "idealFor" TEXT,
  "isPaidMarketing" BOOLEAN NOT NULL DEFAULT false,
  "monthlyPrice" NUMERIC,
  "yearlyPrice" NUMERIC,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isRecommended" BOOLEAN NOT NULL DEFAULT false,
  "categoryId" TEXT,
  "variants" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "service_catalog_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "service_catalog_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "service_catalog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "service_catalog_items_categoryId_idx" ON "service_catalog_items"("categoryId");

CREATE TABLE "service_catalog_orders" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "billingFrequency" TEXT NOT NULL DEFAULT 'MONTHLY',
  "totalAmount" NUMERIC NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "razorpayOrderId" TEXT,
  "razorpayPaymentId" TEXT,
  "razorpaySubscriptionId" TEXT,
  "billingName" TEXT,
  "billingEmail" TEXT,
  "billingGst" TEXT,
  "billingAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  CONSTRAINT "service_catalog_orders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "service_catalog_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "service_catalog_orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "service_catalog_orders_userId_idx" ON "service_catalog_orders"("userId");
CREATE INDEX "service_catalog_orders_organizationId_idx" ON "service_catalog_orders"("organizationId");
CREATE INDEX "service_catalog_orders_status_idx" ON "service_catalog_orders"("status");

CREATE TABLE "service_catalog_order_items" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "variantName" TEXT,
  "monthlyPrice" NUMERIC NOT NULL,
  "isPaidMarketing" BOOLEAN NOT NULL DEFAULT false,
  "marketingConfig" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "service_catalog_order_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "service_catalog_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "service_catalog_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "service_catalog_order_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service_catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "service_catalog_order_items_orderId_idx" ON "service_catalog_order_items"("orderId");

CREATE TABLE "service_briefs" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "progressPercent" INTEGER NOT NULL DEFAULT 0,
  "templateFields" JSONB,
  "responses" JSONB,
  "updates" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "service_briefs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "service_briefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "service_briefs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "service_briefs_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "service_catalog_order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "service_briefs_orderItemId_key" ON "service_briefs"("orderItemId");
CREATE INDEX "service_briefs_userId_idx" ON "service_briefs"("userId");
CREATE INDEX "service_briefs_organizationId_idx" ON "service_briefs"("organizationId");
CREATE INDEX "service_briefs_status_idx" ON "service_briefs"("status");

-- =====================
-- 18. PLATFORM & TEMPLATES
-- =====================

CREATE TABLE "system_templates" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "sectorId" TEXT,
  "content" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "system_templates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "system_templates_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "system_templates_sectorId_idx" ON "system_templates"("sectorId");
CREATE INDEX "system_templates_type_idx" ON "system_templates"("type");

CREATE TABLE "platform_configs" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "platform_configs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "platform_configs_key_key" ON "platform_configs"("key");

-- =====================
-- 19. ENABLE RLS ON ALL TABLES
-- =====================

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "password_reset_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "two_factor_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "two_factor_confirmations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "org_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "org_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "org_role_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "org_member_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wallet_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_features" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_statuses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_LeadToTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_forms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_form_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_views" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "export_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "providers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "locations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointment_service_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "availabilities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_automations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ad_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ad_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboard_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_lists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_catalog_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_catalog_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_catalog_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_catalog_order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_briefs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sectors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "platform_configs" ENABLE ROW LEVEL SECURITY;

-- =====================
-- 20. RLS POLICIES (permissive for development)
-- =====================

DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'users', 'accounts', 'sessions', 'verification_tokens', 'password_reset_tokens',
    'two_factor_tokens', 'two_factor_confirmations', 'organizations', 'organization_members',
    'org_roles', 'org_permissions', 'org_role_permissions', 'org_member_roles',
    'invitations', 'audit_logs', 'wallets', 'wallet_transactions', 'payment_orders',
    'invoices', 'plan_services', 'plans', 'plan_features', 'subscriptions',
    'lead_statuses', 'lead_sources', 'leads', 'lead_activities', 'tags',
    '_LeadToTag', 'lead_forms', 'lead_form_submissions', 'lead_views', 'export_jobs',
    'providers', 'locations', 'appointment_service_categories', 'availabilities',
    'appointments', 'social_connections', 'social_posts', 'social_automations',
    'ad_accounts', 'ad_campaigns', 'notifications', 'dashboard_configs',
    'workspaces', 'workspace_members', 'task_lists', 'tasks', 'task_comments',
    'service_catalog_categories', 'service_catalog_items', 'service_catalog_orders',
    'service_catalog_order_items', 'service_briefs', 'sectors', 'system_templates',
    'platform_configs'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls
  LOOP
    EXECUTE format('CREATE POLICY "allow_select_%s" ON %I FOR SELECT USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "allow_insert_%s" ON %I FOR INSERT WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "allow_update_%s" ON %I FOR UPDATE USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "allow_delete_%s" ON %I FOR DELETE USING (true)', tbl, tbl);
  END LOOP;
END $$;
