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
