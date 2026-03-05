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
