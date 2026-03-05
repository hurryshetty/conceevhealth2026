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

